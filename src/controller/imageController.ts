import { NextFunction, Request, Response } from "express";
import { Image } from "../models/Image";
import AWS from "aws-sdk";
import logger from "../../utils/logger";
import statsdClient, { increment } from "../../utils/statsd";
import multer from "multer";
import { handleError } from "../helper/handleError";

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME;

// Setup Multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for in-memory buffer
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Middleware to validate if the file is uploaded
export const imageValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  increment("imageValidation");
  logger.info("Image validation initiated: /v1/user/self/pic::POST");

  // Check if the file is present in the request
  if (!req.file) {
    logger.error("No file uploaded: /v1/user/self/pic::POST");
    return res.status(400).send();
  }

  // If file exists, proceed to the next middleware/controller
  logger.info("File found, proceeding to upload: /v1/user/self/pic::POST");
  next();
};

export const getProfilePic = async (
  req: Request,
  res: Response
): Promise<void> => {
  increment("profilePic.get");
  logger.info("Get Profile Pic : /v1/user/self/pic::GET");
  const apiStart = Date.now();
  try {
    const authUserId = req.authUser?.id;
    if (!authUserId) {
      logger.error(
        "Unauthorized: Authenticated user not found in request:: /v1/user/self/pic::DELETE"
      );
      res.status(401).json({
        error: "Unauthorized",
        message: "Authenticated user not found:: /v1/user/self/pic::DELETE",
      });
      return;
    }
    const image = await Image.findOne({ where: { user_id: authUserId } });
    if (!image) {
      logger.error("Profile pic not found: /v1/user/self/pic::GET");
      handleError(res, 404, "Profile picture not found", null);
      return;
    }

    res.status(200).json({
      file_name: image.file_name,
      id: image.id,
      url: image.url,
      upload_date: image.upload_date,
      user_id: image.user_id,
    });
    logger.info("Profile pic fetched successfully: /v1/user/self/pic::GET");
    increment("getProfilePic.success");
  } catch (error) {
    handleError(res, 500, "Failed to fetch profile pic", error);
  } finally {
    statsdClient.timing("api.profilePic.get", Date.now() - apiStart);
  }
};

// Allowed image file types
const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

// Function to upload profile picture
export const uploadProfilePic = async (
  req: Request,
  res: Response
): Promise<void> => {
  const apiStart = Date.now();
  increment("profilePic.upload");
  logger.info("Upload Profile Pic : /v1/user/self/pic::POST");
  try {
    const authUserId = req.authUser?.id;
    if (!authUserId) {
      logger.error(
        "Unauthorized: Authenticated user not found in request:: /v1/user/self/pic::POST"
      );
      res.status(401).json({
        error: "Unauthorized",
        message: "Authenticated user not found:: /v1/user/self/pic::POST",
      });
      return;
    }
    // Check if a profile picture already exists for this user
    const existingImage = await Image.findOne({
      where: { user_id: authUserId },
    });

    if (existingImage) {
      logger.error("Profile picture already exists:: /v1/user/self/pic::POST");
      res.status(400).json({ error: "Profile picture already exists" });
      return;
    }

    const file = req.file;
    if (!file) {
      logger.error("No file uploaded:: /v1/user/self/pic::POST");
      res.status(400).send();
      return;
    }

    // Check if the file is an image
    if (!allowedImageTypes.includes(file.mimetype)) {
      logger.error("Invalid file type:: /v1/user/self/pic::POST");
      res.status(400).send();
      return;
    }

    if (!bucketName) {
      logger.error(
        "S3 bucket name is not configured:: /v1/user/self/pic::POST"
      );
      throw new Error("S3 bucket name is not configured");
    }
    const s3Params = {
      Bucket: bucketName,
      Key: `profile-pics/${bucketName}/${authUserId}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload the file to S3
    const uploadResult = await s3.upload(s3Params).promise();
    logger.info(`File uploaded to S3: ${uploadResult.Location}`);

    // Construct the URL in the specified format
    const filePath: string = `profile-pics/${bucketName}/${authUserId}/${file.originalname}`;
    const formattedUrl =
      "https://" + bucketName + ".s3.amazonaws.com/" + filePath;

    // Save metadata to the database
    const newImage = await Image.create({
      user_id: authUserId,
      file_name: file.originalname,
      url: formattedUrl,
      upload_date: new Date(),
    });
    logger.info(
      "Profile pic metadata saved to DB:: /v1/user/self/pic::POST",
      newImage
    );
    // Return success response
    res.status(201).json({
      file_name: newImage.file_name,
      id: newImage.id,
      url: newImage.url,
      upload_date: newImage.upload_date,
      user_id: newImage.user_id,
    });
    logger.info("Profile pic uploaded successfully:: /v1/user/self/pic::POST");
    increment("profilePic.upload.db.success");
  } catch (error) {
    logger.error(`Failed to upload profile pic: ${error}`);
    handleError(res, 500, "", error);
  } finally {
    statsdClient.timing("api.profilePic.post", Date.now() - apiStart);
  }
};

export const deleteProfilePic = async (
  req: Request,
  res: Response
): Promise<void> => {
  const apiStart = Date.now();
  increment("profilePic.delete");
  logger.info("Delete Profile Pic:: /v1/user/self/pic::DELETE");

  try {
    const authUserId = req.authUser?.id;
    if (!authUserId) {
      logger.error(
        "Unauthorized: Authenticated user not found in request:: /v1/user/self/pic::DELETE"
      );
      res.status(401).json({
        error: "Unauthorized",
        message: "Authenticated user not found:: /v1/user/self/pic::DELETE",
      });
      return;
    }
    const image = await Image.findOne({ where: { user_id: authUserId } });

    if (!image) {
      logger.error("Profile pic not found:: /v1/user/self/pic::DELETE");
      res.status(404).json({ error: "Profile picture not found" });
      return;
    }

    // Delete from S3 bucket
    if (!bucketName) {
      logger.error(
        "S3 bucket name is not configured:: /v1/user/self/pic::DELETE"
      );
      throw new Error(
        "S3 bucket name is not configured:: /v1/user/self/pic::DELETE"
      );
    }

    const s3Params = {
      Bucket: bucketName,
      Key: `profile-pics/${bucketName}/${authUserId}/${image.file_name}`,
    };

    await s3.deleteObject(s3Params).promise();
    logger.info("Profile pic deleted from S3:: /v1/user/self/pic::DELETE");
    increment("profilePic.delete.aws.success");
    // Delete from database
    await image.destroy();
    logger.info(
      "Profile pic metadata deleted from DB:: /v1/user/self/pic::DELETE"
    );
    res.status(204).send();
    logger.info("Profile pic deleted successfully:: /v1/user/self/pic::DELETE");
    increment("profilePic.delete.aws.success");
  } catch (error) {
    logger.error(`/v1/user/self/pic::DELETE ${error}`);
    handleError(res, 500, "Failed to delete profile pic", error);
  } finally {
    statsdClient.timing("api.profilePic.delete", Date.now() - apiStart);
  }
};

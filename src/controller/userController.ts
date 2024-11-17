import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { increment, timing } from "../../utils/statsd";
import logger from "../../utils/logger";
import AWS from "aws-sdk";

// Initialize SNS
const sns = new AWS.SNS({ region: process.env.AWS_REGION });

export const getUser = async (req: Request, res: Response): Promise<void> => {
  const apiStart = Date.now();
  try {
    increment("user.get");
    logger.info("Get User Information: /v1/user/self::GET");
    const authHeader = req.headers["authorization"];
    const base64Credentials = authHeader?.split(" ")[1] || "";
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [authenticatedEmail] = credentials.split(":");

    // Reject any query parameters
    if (Object.keys(req.query).length > 0) {
      logger.error(
        "Query parameters are not allowed for this route: /v1/user/self::GET"
      );
      res.status(400).json({
        error: "Bad Request",
        message: "Query parameters are not allowed for this route",
      });
      return;
    }
    // reject any body parameters
    if (Object.keys(req.body).length > 0) {
      logger.error(
        "Body parameters are not allowed for this route: /v1/user/self::GET"
      );
      res.status(400).json({
        error: "Bad Request",
        message: "Body parameters are not allowed for this route",
      });
      return;
    }

    const user = await User.findOne({ where: { email: authenticatedEmail } });

    if (!user) {
      logger.error("User not found: /v1/user/self::GET");
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Return user information (excluding password)
    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
    logger.info("User information fetched successfully: /v1/user/self::GET");
    increment("user.get.success");
  } catch (error) {
    logger.error("Internal server error: /v1/user/self::GET", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while fetching user information",
    });
  } finally {
    timing("api.user.get", Date.now() - apiStart);
  }
};

// POST /v1/user - Create User
export const createUser = async (req: Request, res: Response) => {
  const apiStart = Date.now();
  try {
    increment("user.post");
    logger.info("Create User : /v1/user::POST");
    const { email, password, first_name, last_name } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      logger.error(
        "Bad Request: Invalid Inpit email, password, firstname, lastname: /v1/user::POST"
      );
      res.status(400).json({
        error: "Bad Request",
        message:
          "All fields are required (email, password, first_name, last_name)",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error("Bad email Request: /v1/user::POST");
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.error("User with this email already exists: /v1/user::POST");
      res.status(400).json({
        error: "Bad Request",
        message: "User with this email already exists",
      });
      return;
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      email,
      first_name,
      last_name,
      password: hashedPassword, // Store the hashed password
      account_created: new Date(),
      account_updated: new Date(),
    });
    logger.info("User created successfully: /v1/user::POST");

    // Return user details (excluding password)
    res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
    logger.info("User information fetched successfully: /v1/user::POST");
    increment("user.post.success");

    try {
      // After successfully creating the user in the database
      const user_id = newUser.id;
      const user_email = newUser.email;
      // Publish message to SNS
      if (process.env.SNS_TOPIC_ARN) {
        const params = {
          Message: JSON.stringify({ user_email: user_email, user_id: user_id }),
          TopicArn: process.env.SNS_TOPIC_ARN,
        };

        sns.publish(params, (error, data) => {
          if (error) {
            logger.error("Error publishing to SNS", error);
          } else {
            logger.info("SNS message sent", params.Message);
          }
        });
        logger.info(`SNS message published for user ${user_email}`);
        increment("user.post.sns");
      }
    } catch (error) {
      logger.error("Failed to publish SNS message:", error);
    }
  } catch (error) {
    logger.error("Internal server error: /v1/user::POST", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while creating the user",
    });
  } finally {
    timing("api.user.post", Date.now() - apiStart);
  }
};

// PUT /v1/user - Update User
export const updateUser = async (req: Request, res: Response) => {
  const apiStart = Date.now();
  try {
    increment("user.put");
    logger.info("Update User Information : /v1/user/self::PUT");
    const { first_name, last_name, password } = req.body;

    const authHeader = req.headers["authorization"];
    const base64Credentials = authHeader?.split(" ")[1] || "";
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [authenticatedEmail] = credentials.split(":");

    // Ensure that the user is only trying to update their own account
    if (authenticatedEmail !== req.body.email) {
      logger.error("Forbidden auth email: /v1/user/self::PUT");
      res.status(403).json({
        error: "Forbidden",
        message: "You are not allowed to update other users' accounts",
      });
      return;
    }

    // Validate input: make sure at least one field is provided
    if (!first_name && !last_name && !password) {
      logger.error(
        "Bad Request: make sure at least one field is provided : /v1/user/self::PUT"
      );
      res.status(400).json({
        error: "Bad Request",
        message:
          "At least one field (first_name, last_name, or password) must be provided",
      });
      return;
    }

    // Find the user by authenticated email
    const user = await User.findOne({ where: { email: authenticatedEmail } });

    if (!user) {
      logger.error("User not found: /v1/user/self::PUT");
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Update user fields if provided
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = await bcrypt.hash(password, 10); // Hash new password

    // Update account_updated timestamp
    user.account_updated = new Date();

    // Save updated user information
    await user.save();

    res.status(204).send(); // No content on successful update
    logger.info("User information updated successfully: /v1/user/self::PUT");
    increment("user.put.success");
  } catch (error) {
    logger.error("Internal server error: /v1/user/self::PUT: " + error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while updating user information",
    });
  } finally {
    timing("api.user.put", Date.now() - apiStart);
  }
};

// GET /v1/user/verify - Verify User Email
export const verifyUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const apiStart = Date.now();
  try {
    logger.info("Verify User: /v1/user/self/verify::GET");

    // Extract token and expiration time from query parameters
    const { token } = req.query;
    // Look up user by user_id (token)
    const user = await User.findOne({ where: { id: token } });

    if (!user) {
      logger.error("User not found: /v1/user/self/verify::GET");
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // calucalte expiration time (2 mins) from user created time, make sure user is not null
    const expires = user
      ? Math.floor(user.account_created.getTime() / 1000) + 120
      : 0;

    // Validate required query parameters, make sure token and expires are not null
    if (!token || !expires || expires === 0) {
      logger.error(
        "Missing or invalid token or expires parameter: /v1/user/self/verify::GET",
        { token, expires }
      );
      res.status(400).json({
        error: "Bad Request",
        message: "Token and expires parameters are required",
      });
      return;
    }

    // now check if expiration time is greater than current time
    if (expires < Math.floor(Date.now() / 1000)) {
      logger.error("Token expired: /v1/user/self/verify::GET", {
        token,
        expires,
      });
      res.status(400).json({
        error: "Bad Request",
        message: "Token has expired",
      });
      return;
    }
    // Mark the user's email as verified
    user.email_verified = true;
    user.account_updated = new Date();
    await user.save();

    logger.info("User verified successfully: /v1/user/self/verify::GET", {
      user,
    });
    res.status(200).json({
      message: "Your email has been successfully verified.",
    });
  } catch (error) {
    logger.error("Internal server error: /v1/user/self/verify::GET", error);
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred during verification",
    });
  } finally {
    timing("api.user.verify", Date.now() - apiStart);
  }
};

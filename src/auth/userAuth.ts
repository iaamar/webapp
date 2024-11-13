import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";

// Extend the Request interface to include authUser
declare global {
  namespace Express {
    interface Request {
      authUser?: User;
    }
  }
}
import bcrypt from "bcrypt";
import sequelize from "../database/connect";
import logger from "../../utils/logger";
import { increment, timing } from "../../utils/statsd";

export const basicAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiStart = Date.now();
  logger.info("Basic Auth Middleware: Start");
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    logger.error(
      "Unauthorized: No authorization header provided:: Basic Auth Middleware"
    );
    increment("basicAuth.noAuthHeader");
    res.status(401).json({
      error: "Unauthorized",
      message: "No authorization header provided",
    });
    return;
  }

  // Extract the base64 encoded part of the header
  const base64Credentials = authHeader?.split(" ")[1] || "";
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "ascii"
  );

  // Expected format is 'username:password'
  const [username, password] = credentials.split(":");

  if (!username || !password) {
    logger.error(
      "Bad request: Missing username or password:: Basic Auth Middleware"
    );
    increment("basicAuth.missingUsername or password");
    res.status(400).json({
      error: "Bad request",
      message: "Missing username or password",
    });
    return;
  }

  try {
    // Find the user by username (email in this case)
    const user = await User.findOne({ where: { email: username } });
    console.log("user: " + user);
    req.authUser = user || undefined;
    if (!user) {
      logger.error("User not found: Basic Auth Middleware");
      increment("basicAuth.userNotFound");
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Compare the password provided in Basic Auth with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.error("Forbidden: Invalid credentials:: Basic Auth Middleware");
      increment("basicAuth.invalidCredentials");
      res.status(403).json({
        error: "Forbidden",
        message: "Invalid credentials",
      });
      return;
    }
    console.log("authUSer: " + req.authUser);
    logger.info("Basic Auth Middleware: Password is valid");

    // Password is valid, proceed with the request
    next();
  } catch (error) {
    logger.error(
      "Internal server error: Error during authentication:: Basic Auth Middleware::" +
        error
    );
    increment("basicAuth.internalServerError");
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred during authentication",
    });
  } finally {
    timing("api.basicAuth", Date.now() - apiStart);
  }
};

// Middleware to check the database connection on every API call
export const checkDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiStart = Date.now();
  try {
    await sequelize.authenticate();
    logger.info("Database connection is available:: checkDatabaseConnection");
    increment("checkDatabaseConnection.success");
    next(); // Proceed with the request
  } catch (error) {
    logger.error(
      "Service Unavailable: Database connection is not available:: checkDatabaseConnection::" +
        error
    );
    increment("checkDatabaseConnection.error");
    res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection is not available",
    });
  } finally {
    timing("api.checkDatabaseConnection", Date.now() - apiStart);
  }
};

export const checkVerifiedUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const base64Credentials = authHeader?.split(" ")[1] || "";
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    // Find user in the database
    const user = await User.findOne({ where: { email: username } });

    if (!user || !user.email_verified) {
      logger.error("Access denied: User not verified.", { username });
      return res.status(403).json({
        error: "Forbidden",
        message: "You must verify your email to access this resource.",
      });
    } else {
      logger.info("User is verified.");
    }

    next();
  } catch (error) {
    logger.error("Verification check failed:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while checking user verification status",
    });
  }
};

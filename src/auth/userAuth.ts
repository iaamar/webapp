import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";

// Extend the Request interface to include authUser
declare module 'express-serve-static-core' {
  interface Request {
    authUser?: User;
  }
}
import bcrypt from "bcrypt";
import sequelize from "../database/connect";
import logger from "../../utils/logger";
import client from "../../utils/statsd";

export const basicAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.info("Basic Auth Middleware: Start");
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      logger.error("Unauthorized: No authorization header provided:: Basic Auth Middleware");
      res.status(401).json({
        error: "Unauthorized",
        message: "No authorization header provided",
      });
      return;
    }
  
    // Extract the base64 encoded part of the header
    const base64Credentials = authHeader?.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    
    // Expected format is 'username:password'
    const [username, password] = credentials.split(':');
  
    if (!username || !password) {
      logger.error("Bad request: Missing username or password:: Basic Auth Middleware");
      res.status(400).json({
        error: "Bad request",
        message: "Missing username or password",
      });
      return;
    }
  
    try {
      // Find the user by username (email in this case)
      const user = await User.findOne({ where: { email: username } });
      req.authUser = user || undefined;
      if (!user) {
        logger.error("User not found: Basic Auth Middleware");
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
        res.status(403).json({
          error: "Forbidden",
          message: "Invalid credentials",
        });
        return;
      }
  
      // Password is valid, proceed with the request
      next();
    } catch (error) {
      logger.error("Internal server error: Error during authentication:: Basic Auth Middleware::"+error);
      res.status(500).json({
        error: "Internal server error",
        message: "An error occurred during authentication",
      });
    }
  };
  
  // Middleware to check the database connection on every API call
 export const checkDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info("Checking database connection:: checkDatabaseConnection");
      client.increment("checkDatabaseConnection");
      await sequelize.authenticate();
      next();  // Proceed with the request
    } catch (error) {
      logger.error("Service Unavailable: Database connection is not available:: checkDatabaseConnection::"+error);
      res.status(503).json({
        error: "Service Unavailable",
        message: "Database connection is not available",
      });
    }
  };
  
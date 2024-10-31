import logger from "../../utils/logger";
import { Request, Response } from "express";
import client from "../../utils/statsd";

// Middleware for 405 Method Not Allowed response
export const picMethodNotAllowed = (req: Request, res: Response) => {
  client.increment(`${req.method.toLowerCase()}.methodNotAllowed`);
  logger.error(`Method Not Allowed: ${req.method} /v1/user/self/pic`);
  res.status(405).json({
    error: "Method Not Allowed",
    message: `The ${req.method} method is not supported for this endpoint`,
  });
};

// Helper function to handle errors and log them
export const handleError = (
  res: Response,
  statusCode: number,
  message: string,
  error: any
) => {
  logger.error(`${message}: ${error}`);
  res.status(statusCode).send();
};

export const otherUserRoutes = async (req: Request, res: Response) => {
  // Respond with 405 Method Not Allowed for unsupported methods on /v1/user/self
  logger.info(
    "Method Not Allowed :/v1/user/self:: allowedMethods GET & PUT only"
  );
  const allowedMethods = ["GET", "PUT"];
  if (!allowedMethods.includes(req.method)) {
    res.set("Allow", allowedMethods.join(", "));
    res.status(405).json({
      error: "Method Not Allowed",
      message: `Only ${allowedMethods.join(", ")} are allowed for this route`,
    });
  }
};

// Respond with 405 Method Not Allowed for unsupported methods on /healthz
export const methodNotAllowed = (req: Request, res: Response) => {
  client.increment("healthz.methodNotAllowed");
  logger.error("Method Not Allowed :/healthz");
  const allowedMethods = ["GET"];
  if (!allowedMethods.includes(req.method)) {
    res.set("Allow", allowedMethods.join(", "));
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

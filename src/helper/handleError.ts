import logger from "../../utils/logger";
import { Request, Response } from "express";
import { increment } from "../../utils/statsd";

// Middleware for 405 Method Not Allowed response
export const picMethodNotAllowed = (req: Request, res: Response) => {
  logger.error(`Method Not Allowed: ${req.method} /v1/user/self/pic`);
  increment(`${req.method.toLowerCase()}.picMethodNotAllowed`);
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
    if (!res.headersSent) {
      res.status(statusCode).json({ error: message, details: error });
    }
};

export const otherUserRoutes = async (req: Request, res: Response) => {
  // Respond with 405 Method Not Allowed for unsupported methods on /v1/user/self
  logger.error(
    "Method Not Allowed :/v1/user/self:: allowedMethods GET & PUT only"
  );
  increment("user.methodNotAllowed");
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
  logger.error("Method Not Allowed :/healthz");
  increment("healthz.methodNotAllowed");
  const allowedMethods = ["GET"];
  if (!allowedMethods.includes(req.method)) {
    res.set("Allow", allowedMethods.join(", "));
    res.status(405).json({ message: "Method Not Allowed" });
  }
};

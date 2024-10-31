// healthzController.ts
import { Request, Response } from "express";
import client from "../../utils/statsd";
import logger from "../../utils/logger";

// Health check GET route handler
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const inputs = {
      headers: req.headers,
      queryParams: req.query,
      body: req.body,
    };
    client.increment("healthz.get" + inputs);
    logger.info("Health check point :/healthz");
    res.status(200).send();
  } catch (error) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid input data",
    });
  }
};

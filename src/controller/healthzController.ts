// healthzController.ts
import { Request, Response } from "express";
import logger from "../../utils/logger";
import { increment } from "../../utils/statsd";
import { handleError } from "../helper/handleError";

// Health check GET route handler
export const healthCheck = async (req: Request, res: Response) => {
  try {
    const inputs = {
      headers: req.headers,
      queryParams: req.query,
      body: req.body,
    };
    increment("healthz.get" + inputs);
    logger.info("Health check point :/healthz");
    res.status(200).send();
  } catch (error) {
    logger.error("Internal server error: /healthz");
    handleError(res, 400, "Bad Request", error);
  }
};

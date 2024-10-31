// healthzController.ts
import { Request, Response } from "express";
import logger from "../../utils/logger";
import statsdClient, { increment } from "../../utils/statsd";
import { handleError } from "../helper/handleError";

// Health check GET route handler
export const healthCheck = async (req: Request, res: Response) => {
  const apiStart = Date.now();
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
  } finally {
    statsdClient.timing("api.healthz.get", Date.now() - apiStart);
  }
};

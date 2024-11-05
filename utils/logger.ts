import { createLogger, format, transports } from "winston";
import { TransformableInfo } from "logform";
import * as appRoot from "app-root-path";
import moment from "moment-timezone";

const utcTimestampFormat = () => {
  return moment.utc().format("YYYY-MM-DD HH:mm:ss");
};

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: utcTimestampFormat,
    }),
    format.printf((info: TransformableInfo) =>
      JSON.stringify({
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
      })
    )
  ),
  transports: [
    new transports.File({
      filename: `${appRoot}/logs/csye6225application.log`,
    }),
    new transports.Console(),
  ],
});

export default logger;

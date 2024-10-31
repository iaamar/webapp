import { createLogger, format, transports } from "winston";
import { TransformableInfo } from "logform";
import * as appRoot from "app-root-path";
import moment from "moment-timezone";

const estTimestampFormat = () => {
  return moment().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");
};

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: estTimestampFormat,
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

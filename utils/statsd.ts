var statdClient = require("statsd-client");

export default new statdClient({
  port: 8125,
  host: "localhost",
});

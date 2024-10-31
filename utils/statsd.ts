// stats.ts

import StatsD from "statsd-client";
import moment from "moment-timezone";

// Initialize StatsD client
const statsdClient = new StatsD({
  port: 8125,
  host: "localhost",
});

// Helper function to get timestamp in EST
const getEstTimestamp = () =>
  moment().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");

// Wrapper for StatsD increment with timestamped logging
const incrementWithTimestamp = (key: string) => {
  const estTimestamp = getEstTimestamp();
  console.log(`[${estTimestamp}] Incrementing metric: ${key}`); // Log in EST
  statsdClient.increment(key);
};

// Wrapper for StatsD timing with timestamped logging
const timingWithTimestamp = (key: string, duration: number) => {
  const estTimestamp = getEstTimestamp();
  console.log(
    `[${estTimestamp}] Timing metric: ${key}, Duration: ${duration} ms`
  ); // Log in EST
  timing(key, duration);
};

function timing(key: string, duration: number) {
  statsdClient.timing(key, duration);
}

// Exporting the wrappers and client
export { incrementWithTimestamp as increment, timingWithTimestamp as timing };
export default statsdClient;

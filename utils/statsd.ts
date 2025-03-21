// stats.ts

import StatsD from "statsd-client";
import moment from "moment-timezone";

// Initialize StatsD client
const statsdClient = new StatsD({
  port: 8125,
  host: "localhost",
});

// Helper function to get timestamp in UTC
const getUtcTimestamp = () =>
  moment.utc().format("YYYY-MM-DD HH:mm:ss");

// Wrapper for StatsD increment with timestamped logging
const incrementWithTimestamp = (key: string) => {
  const utcTimestamp = getUtcTimestamp();
  console.log(`[${utcTimestamp} UTC] Incrementing metric: ${key}`); // Log in UTC
  statsdClient.increment(key);
};

// Wrapper for StatsD timing with timestamped logging
const timingWithTimestamp = (key: string, duration: number) => {
  const utcTimestamp = getUtcTimestamp();
  console.log(
    `[${utcTimestamp} UTC] Timing metric: ${key}, Duration: ${duration} ms`
  ); // Log in UTC
  timing(key, duration);
};

function timing(key: string, duration: number) {
  statsdClient.timing(key, duration);
}

// Exporting the wrappers and client
export { incrementWithTimestamp as increment, timingWithTimestamp as timing };
export default statsdClient;

import StatsD from "statsd-client"
import moment from "moment-timezone";

// Initialize StatsD client
const statsdClient = new StatsD({
  port: 8125,
  host: "localhost",
});

// Helper function to get timestamp in EST
const getEstTimestamp = () => moment().tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");

// Wrapper for StatsD client with timestamped logging
const incrementWithTimestamp = (key: string) => {
  const estTimestamp = getEstTimestamp();
  console.log(`[${estTimestamp}] Incrementing metric: ${key}`); // Log in EST
  statsdClient.increment(key);
};

// Exporting the wrapper and client as needed
export { incrementWithTimestamp as increment };
export default statsdClient;

import logger from "../../utils/logger";
import { increment, timing } from "../../utils/statsd";
import { initImageModel } from "../models/Image";
import { initUserModel } from "../models/User";

require("dotenv").config(); // Load environment variables from .env

const { Sequelize } = require("sequelize");

// Initialize the Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    dialectOptions: {
      useUTC: true,
    },
    logging: false,
  }
);

// Function to bootstrap the database
export const bootstrapDatabase = async (): Promise<void> => {
  const apiStart = Date.now();
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");
    await sequelize.drop(); // Drop all tables
    // Initialize models
    initUserModel(sequelize);
    initImageModel(sequelize);

    // Sync models with the database (creates tables if they don't exist)
    await sequelize.sync({ force: true }); // `alter: true` updates the schema without dropping tables

    logger.info("Database bootstrapped and synchronized.");
    increment("db.bootstrap.success");
  } catch (error) {
    console.error("Unable to connect to the database or bootstrap:", error);
    increment("db.bootstrap.error");
    throw error; // Throw the error to stop the server from starting
  } finally {
    timing("api.db.bootstrap", Date.now() - apiStart);
  }
};

export default sequelize;

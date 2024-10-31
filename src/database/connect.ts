import logger from "../../utils/logger";
import { increment } from "../../utils/statsd";
import { initImageModel } from "../models/Image";
import { initUserModel } from "../models/User";

require('dotenv').config(); // Load environment variables from .env

const { Sequelize } = require('sequelize');

// Initialize the Sequelize instance
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD,{
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: process.env.DB_PORT,
  timezone: '-05:00',
  dialectOptions: {
    useUTC: false,
  },
  logging: false,
});

// Function to bootstrap the database
export const bootstrapDatabase = async (): Promise<void> => {
  try {
    logger.info("Connecting to the database...");
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");

    // Initialize models
    initUserModel(sequelize);
    initImageModel(sequelize);

    // Sync models with the database (creates tables if they don't exist)
    await sequelize.sync({ force: true });  // `alter: true` updates the schema without dropping tables

    logger.info("Database bootstrapped and synchronized.");
    increment("db.bootstrap.success");
  } catch (error) {
    console.error("Unable to connect to the database or bootstrap:", error);
    increment("db.bootstrap.error");
    throw error;  // Throw the error to stop the server from starting
  }
};

export default sequelize;

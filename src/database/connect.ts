import { initUserModel } from "../models/User";

require('dotenv').config(); // Load environment variables from .env

const { Sequelize } = require('sequelize');

// Construct the database URI using environment variables
const DB_URI = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// Initialize the Sequelize instance
const sequelize = new Sequelize(DB_URI);

// Function to bootstrap the database
export const bootstrapDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Initialize models
    //initAccountModel(sequelize);
    initUserModel(sequelize);

    // Sync models with the database (creates tables if they don't exist)
    await sequelize.sync({ force: true });  // `alter: true` updates the schema without dropping tables

    console.log("Database bootstrapped and synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database or bootstrap:", error);
    throw error;  // Throw the error to stop the server from starting
  }
};

export default sequelize;

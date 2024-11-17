import express from "express";
import dotenv from "dotenv";
import { bootstrapDatabase } from "./database/connect";
import {
  createUser,
  getUser,
  updateUser,
  verifyUser,
} from "./controller/userController";
import { basicAuth, checkDatabaseConnection, checkVerifiedUser } from "./auth/userAuth";
import {
  deleteProfilePic,
  getProfilePic,
  imageValidation,
  upload,
  uploadProfilePic
} from "./controller/imageController";
import { healthCheck } from "./controller/healthzController";
import { methodNotAllowed, otherUserRoutes, picMethodNotAllowed } from "./helper/handleError";
import logger from "../utils/logger";

dotenv.config();

const app = express();
const port = process.env.PORT || 9001;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware stack for both Basic Auth and DB Connection
const auth = [basicAuth];
const dbCheck = [checkDatabaseConnection];

// Healthz Routes

// Health check GET route
app.get("/healthz", dbCheck, healthCheck);
// Respond with 405 Method Not Allowed for unsupported methods on /healthz
app.all("/healthz", methodNotAllowed);

// User Routes

// GET /v1/user/self - Get User Information excluding password
app.get("/v1/user/self", [...auth, checkVerifiedUser], getUser);
// POST /v1/user - Create User
app.post("/v1/user", createUser);
// PUT /v1/user/self - Update User Information
app.put("/v1/user/self", [...auth, checkVerifiedUser], updateUser);
// Respond with 405 Method Not Allowed for unsupported methods on /v1/user/self
app.all("/v1/user/self", otherUserRoutes);
// GET /v1/user/verify - Verify User Email
app.get("/v1/user/self/verify", verifyUser);

// Profile Picture Routes

// POST /v1/user/self/pic - Upload Profile Picture
app.post("/v1/user/self/pic", [...auth, checkVerifiedUser], upload.single("file"), imageValidation, uploadProfilePic);
// GET /v1/user/self/pic - Get Profile Picture
app.get("/v1/user/self/pic", [...auth, checkVerifiedUser], getProfilePic);
// Delete /v1/user/self/pic - Delete Profile Picture
app.delete("/v1/user/self/pic", [...auth, checkVerifiedUser], deleteProfilePic);
// Unsupported /v1/user/self/pic 
app.head("/v1/user/self/pic", picMethodNotAllowed);
app.options("/v1/user/self/pic", picMethodNotAllowed);
app.patch("/v1/user/self/pic", picMethodNotAllowed);
app.put("/v1/user/self/pic", picMethodNotAllowed);

// Start the server and bootstrap the database
const startServer = async () => {
  try {
    logger.info("Starting the server...");
    await bootstrapDatabase(); // Bootstrap the database before starting the server
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error(
      "Error bootstrapping the database or starting the server:",
      error
    );
    console.error(
      "Error bootstrapping the database or starting the server:",
      error
    );
    process.exit(1); // Exit the process with failure if something goes wrong
  }
};

// Initialize the server
startServer();

export { app, startServer };

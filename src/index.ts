import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import sequelize, { bootstrapDatabase } from "./database/connect";
import { User } from "./models/User";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

const basicAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({
      error: "Unauthorized",
      message: "No authorization header provided",
    });
    return;
  }

  // Extract the base64 encoded part of the header
  const base64Credentials = authHeader?.split(' ')[1] || '';
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  
  // Expected format is 'username:password'
  const [username, password] = credentials.split(':');

  if (!username || !password) {
    res.status(400).json({
      error: "Bad request",
      message: "Missing username or password",
    });
    return;
  }

  try {
    // Find the user by username (email in this case)
    const user = await User.findOne({ where: { email: username } });

    if (!user) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Compare the password provided in Basic Auth with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(403).json({
        error: "Forbidden",
        message: "Invalid credentials",
      });
      return;
    }

    // Password is valid, proceed with the request
    next();
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred during authentication",
    });
  }
};

// Middleware to check the database connection on every API call
const checkDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Attempt to authenticate with the database
    await sequelize.authenticate();
    next();  // Proceed with the request
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection is not available",
    });
  }
};

// Middleware stack for both Basic Auth and DB Connection
const authAndDbCheck = [basicAuth, checkDatabaseConnection];

// Health check GET route that returns inputs without hardcoded status or message
app.get("/healthz", async (req: Request, res: Response) => {
  try {
    const inputs = {
      headers: req.headers,
      queryParams: req.query,
      body: req.body,
    };
    res.status(200).send();
  } catch (error) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid input data",
    });
  }
});

// Respond with 405 Method Not Allowed for unsupported methods on /healthz
app.all('/healthz', (req: Request, res: Response) => {
  const allowedMethods = ['GET'];
  if (!allowedMethods.includes(req.method)) {
    res.set('Allow', allowedMethods.join(', '));
    res.status(405).json({ message: 'Method Not Allowed' });
  }
});

// GET /v1/user/self - Get User Information excluding password
app.get('/v1/user/self', authAndDbCheck, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader?.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [authenticatedEmail] = credentials.split(':');

    // Reject any query parameters
    if (Object.keys(req.query).length > 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Query parameters are not allowed for this route",
      });
      return;
    }
    // reject any body parameters
    if (Object.keys(req.body).length > 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Body parameters are not allowed for this route",
      });
      return;
    }

    const user = await User.findOne({ where: { email: authenticatedEmail } });

    if (!user) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Return user information (excluding password)
    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      account_created: user.account_created,
      account_updated: user.account_updated,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while fetching user information",
    });
  }
});

// POST /v1/user - Create User
app.post('/v1/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({
        error: "Bad Request",
        message: "All fields are required (email, password, first_name, last_name)",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid email format",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        error: "Bad Request",
        message: "User with this email already exists",
      });
      return;
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      email,
      first_name,
      last_name,
      password: hashedPassword,  // Store the hashed password
      account_created: new Date(),
      account_updated: new Date(),
    });

    // Return user details (excluding password)
    res.status(201).json({
      id: newUser.id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      account_created: newUser.account_created,
      account_updated: newUser.account_updated,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while creating the user",
    });
  }
});

// PUT /v1/user/self - Update User Information
app.put('/v1/user/self', authAndDbCheck, async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, password } = req.body;

    const authHeader = req.headers['authorization'];
    const base64Credentials = authHeader?.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [authenticatedEmail] = credentials.split(':');

    // Ensure that the user is only trying to update their own account
    if (authenticatedEmail !== req.body.email) {
      res.status(403).json({
        error: "Forbidden",
        message: "You are not allowed to update other users' accounts",
      });
      return;
    }

    // Validate input: make sure at least one field is provided
    if (!first_name && !last_name && !password) {
      res.status(400).json({
        error: "Bad Request",
        message: "At least one field (first_name, last_name, or password) must be provided",
      });
      return;
    }

    // Find the user by authenticated email
    const user = await User.findOne({ where: { email: authenticatedEmail } });

    if (!user) {
      res.status(404).json({
        error: "Not Found",
        message: "User not found",
      });
      return;
    }

    // Update user fields if provided
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (password) user.password = await bcrypt.hash(password, 10);  // Hash new password

    // Update account_updated timestamp
    user.account_updated = new Date();

    // Save updated user information
    await user.save();

    res.status(204).send(); // No content on successful update
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while updating user information",
    });
  }
});

// Respond with 405 Method Not Allowed for unsupported methods on /v1/user/self
app.all('/v1/user/self', (req: Request, res: Response) => {
  const allowedMethods = ['GET', 'PUT'];
  if (!allowedMethods.includes(req.method)) {
    res.set('Allow', allowedMethods.join(', '));
    res.status(405).json({
      error: "Method Not Allowed",
      message: `Only ${allowedMethods.join(', ')} are allowed for this route`,
    });
  }
});

// Helper function to simulate async processing
const processData = (data: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Simulate some processing time with setTimeout
    setTimeout(() => {
      if (Object.keys(data).length === 0) {
        return reject(new Error("No data provided"));
      }
      resolve({
        status: "OK",
        message: "Data processed successfully",
        processedData: data,
      });
    }, 1000); // Simulating a delay of 1 second for async processing
  });
};

// Start the server and bootstrap the database
const startServer = async () => {
  try {
    await bootstrapDatabase(); // Bootstrap the database before starting the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error(
      "Error bootstrapping the database or starting the server:",
      error
    );
    process.exit(1); // Exit the process with failure if something goes wrong
  }
};

// Initialize the server
startServer();

export {app, startServer};
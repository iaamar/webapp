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

// Predefined token for demonstration purposes
const VALID_TOKEN = "my-secret-token";

// Middleware to handle basic token-based authentication
const basicAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({
      status: "Unauthorized",
      message: "No authorization header provided",
    });
    return;
  }

  // Extract the base64 encoded part of the header
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  
  // Expected format is 'username:token'
  const [username, token] = credentials.split(':');

  if (!token || token !== VALID_TOKEN) {
    res.status(403).json({
      status: "Forbidden",
      message: "Invalid or missing token",
    });
    return;
  }

  // Token is valid, proceed with the request
  next();
};

// Middleware to check the database connection on every API call
const checkDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Attempt to authenticate with the database
    await sequelize.authenticate();
    console.log("Database connection is active.");
    next();  // Proceed with the request
  } catch (error) {
    console.error("Database connection failed.", error);
    res.status(503).json({
      status: "Service Unavailable",
      message: "Database connection is not available",
    });
  }
};

// Middleware stack for both Basic Auth and DB Connection
const authAndDbCheck = [basicAuth, checkDatabaseConnection];


// Health check GET route that also requires valid token and DB check
app.get("/healthz", async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: "OK",
      message: "Health check passed",
    });
  } catch (error) {
    res.status(400).json({
      status: "Error",
      message: "An error occurred while processing data",
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


// Authenticated endpoint for other API calls that require both token and DB connection
app.post('/authenticated-endpoint', authAndDbCheck, (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Successfully authenticated and database is connected",
    data: req.body,
  });
});

// Non-authenticated public endpoint (for testing purposes)
app.get('/public', (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Public endpoint",
  });
});


// GET /v1/user/self - Get User Information
app.get('/v1/user/self', authAndDbCheck, async (req: Request, res: Response) => {
  try {
    // Extract the email (username) from Basic Auth
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
       res.status(401).json({ message: 'Unauthorized: No authorization header provided' });
       return;
    }

    // Decode the Basic Auth credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [authenticatedEmail, token] = credentials.split(':');

    // Check if authenticatedEmail is undefined or invalid
    if (!authenticatedEmail) {
       res.status(400).json({ message: 'Invalid authentication credentials' });
       return;
    }

    // Find the user by email (authenticatedEmail)
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
     res.status(404).json({ message: 'Self user not found' });
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
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching user information' });
  }
});


// create user
app.post('/v1/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name) {
       res.status(400).json({ message: 'Bad request: All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
       res.status(400).json({ message: 'Bad request: User with this email already exists' });
    }

    // Hash the password using bcrypt with salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user (account_created and account_updated set automatically)
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
    console.error(error);
    res.status(500).json({ message: 'Bad request: An error occurred while creating the user' });
  }
});


// PUT /v1/user/self - Update User Information - self
app.put('/v1/user/self', authAndDbCheck, async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, password } = req.body;

    // Extract the authenticated email (username) from Basic Auth
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
       res.status(401).json({ message: 'Unauthorized: No authorization header provided' });
       return;
    }

    // Decode the Basic Auth credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [authenticatedEmail, token] = credentials.split(':');

    // Ensure that the user is only trying to update their own account
    const targetEmail = req.body.email;

    if (authenticatedEmail !== targetEmail) {
       res.status(403).json({ message: 'You are not allowed to update other users accounts.' });
       return;
    }

    // Validate input: make sure at least one field is provided
    if (!first_name && !last_name && !password) {
       res.status(400).json({ message: 'Bad request: At least one field (first_name, last_name, or password) must be provided' });
       return;
    }

    // Find the user by authenticated email
    const user = await User.findOne({ where: { email: authenticatedEmail } });

    if (!user) {
       res.status(404).json({ message: 'User not found' });
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
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating user information' });
  }
});


// Respond with 405 Method Not Allowed for unsupported methods on /v1/user/self
app.all('/v1/user/self', (req: Request, res: Response) => {
  const allowedMethods = ['GET', 'PUT'];
  if (!allowedMethods.includes(req.method)) {
    res.set('Allow', allowedMethods.join(', '));
    res.status(405).json({ message: 'Method Not Allowed' });
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
    console.log("Bootstrapping the database...");
    await bootstrapDatabase(); // Bootstrap the database before starting the server

    // Start the server
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

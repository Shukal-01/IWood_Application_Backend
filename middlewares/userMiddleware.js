import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// Access config var
let accessToken = process.env.TOKEN_SECRET_USER;

function generateAccessToken(userData) {
  // Generate access token with expiration time of 2 hours
  return jwt.sign({ userData }, accessToken, {
    expiresIn: "7200000s", // Using a valid expiration time format
  });
}

function authenticateToken(req, res, next) {
  try {
    // console.log("Authenticating token...");
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new Error("Authorization header missing!");
    }
    const token = authHeader.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed! Token missing!");
    }

    // Verify token
    const verified = jwt.verify(token, accessToken);
    // console.log("Token verified:", verified);
    req.user = verified;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).send("Invalid token or authentication failed!");
  }
}

function getUserData(givenToken) {
  return jwt.verify(givenToken, accessToken);
}

const userMiddleware = { authenticateToken, generateAccessToken, getUserData };

export default userMiddleware;

import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

// access config var
let accessToken = process.env.TOKEN_SECRET;

function generateAccessToken(userData) {
  return jwt.sign({ userData }, accessToken, {
    expiresIn: "50000s",
  });
}

function authenticateToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const verified = jwt.verify(token, accessToken);
    req.user = verified;

    next();
  } catch (err) {
    res.status(404).send("Invalid token !");
  }
}

const adminMiddleware = { authenticateToken, generateAccessToken };

export default adminMiddleware;

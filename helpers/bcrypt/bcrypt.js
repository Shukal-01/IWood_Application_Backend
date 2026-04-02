import bcrypt from "bcrypt";

// Define the number of salt rounds (higher = more secure but slower)
const SALT_ROUNDS = process.env.SALT_ROUND;

/**
 * Encrypts a plain text password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password from the database
 * @returns {Promise<boolean>} - Returns true if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

const bcryptUtils = { hashPassword, comparePassword };

export default bcryptUtils;

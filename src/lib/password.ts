import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
export const PEPPER =
  process.env.PASSWORD_PEPPER || "change-this-pepper-in-production";

/**
 * Generate a cryptographic salt for password hashing
 * This salt is explicitly stored in the database for demonstration purposes
 */
export function generateSalt(): string {
  return bcrypt.genSaltSync(SALT_ROUNDS);
}

/**
 * Hash a password using salt and pepper
 * Formula: bcrypt.hash(password + pepper, salt)
 *
 * @param password - The plain text password
 * @param salt - The explicitly generated salt
 * @returns The hashed password
 */
export async function hashPassword(
  password: string,
  salt: string,
): Promise<string> {
  return bcrypt.hash(password + PEPPER, salt);
}

/**
 * Compare a plain text password with a hashed password using the stored salt
 * Formula: bcrypt.compare(password + pepper, storedHash)
 *
 * Note: The salt parameter is used for demonstration purposes to show that
 * we store the salt explicitly. Bcrypt extracts the salt from the stored hash
 * automatically during comparison.
 *
 * @param password - The plain text password to verify
 * @param hashedPassword - The stored hashed password
 * @param salt - The stored salt (for demonstration)
 * @returns True if the password matches, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string,
  salt: string,
): Promise<boolean> {
  // Use bcrypt.compare which automatically extracts salt from hashedPassword
  // The salt parameter is available for demonstration/verification purposes
  return bcrypt.compare(password + PEPPER, hashedPassword);
}

/**
 * Utility functions for auto-generating usernames and passwords
 */

/**
 * Generate a unique username from first and last name
 * Format: {lastNameInitial}{firstName}-{randomId}
 * Example: John Doe → djoe-a7k9
 */
export function generateUsername(firstName: string, lastName: string): string {
  // Normalize names to lowercase
  const normalizedFirstName = firstName.toLowerCase().trim();
  const normalizedLastName = lastName.toLowerCase().trim();

  // Get last name initial
  const lastNameInitial = normalizedLastName.charAt(0);

  // Create base username: lastNameInitial + firstName
  const baseUsername = `${lastNameInitial}${normalizedFirstName}`;

  // Generate random 4-character alphanumeric ID
  const randomId = generateRandomId(4);

  return `${baseUsername}-${randomId}`;
}

/**
 * Generate a random alphanumeric string
 */
function generateRandomId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a secure random password
 * Includes uppercase, lowercase, numbers, and special characters
 */
export function generatePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + special;

  // Ensure at least one character from each category
  let password = "";
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password to randomize the position of required characters
  return shuffleString(password);
}

/**
 * Shuffle a string randomly
 */
function shuffleString(str: string): string {
  const arr = str.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

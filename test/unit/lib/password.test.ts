import { describe, it, expect } from "vitest";
import { hashPassword, generateSalt, comparePassword } from "@/lib/password";

describe("Password utilities", () => {
  describe("generateSalt", () => {
    it("should generate a valid salt string", () => {
      const salt = generateSalt();
      expect(typeof salt).toBe("string");
      expect(salt.length).toBeGreaterThan(10);
    });

    it("should generate unique salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe("hashPassword", () => {
    it("should return a hash of the password with salt", async () => {
      const password = "testPassword123";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      expect(typeof hash).toBe("string");
      expect(hash).not.toEqual(password);
    });

    it("should produce different hashes for same password with different salts", async () => {
      const password = "testPassword123";
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      const hash1 = await hashPassword(password, salt1);
      const hash2 = await hashPassword(password, salt2);

      expect(hash1).not.toEqual(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testPassword123";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await comparePassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await comparePassword(wrongPassword, hash, salt);
      expect(isValid).toBe(false);
    });
  });
});

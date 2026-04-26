import { describe, it, expect, vi } from "vitest";
import {
  hashPassword,
  generateSalt,
  comparePassword,
  PEPPER,
} from "@/lib/password";
import bcrypt from "bcryptjs";

describe("Password utilities", () => {
  describe("generateSalt", () => {
    it("should generate a valid bcrypt salt string", () => {
      const salt = generateSalt();

      expect(typeof salt).toBe("string");
      expect(salt.length).toBeGreaterThan(20);
      expect(salt.match(/^\$2[aby]\$12\$/)).toBeTruthy();
    });

    it("should generate unique salts on each call", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1).not.toEqual(salt2);
    });
  });

  describe("hashPassword", () => {
    it("should return a hash that does not contain the plain password", async () => {
      const password = "testPassword123!";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      expect(typeof hash).toBe("string");
      expect(hash).not.toContain(password);
      expect(hash.match(/^\$2[aby]\$12\$/)).toBeTruthy();
    });

    it("should produce different hashes for same password with different salts", async () => {
      const password = "testPassword123!";
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      const hash1 = await hashPassword(password, salt1);
      const hash2 = await hashPassword(password, salt2);

      expect(hash1).not.toEqual(hash2);
    });

    it("should correctly apply pepper to the password", async () => {
      const password = "test123";
      const salt = generateSalt();

      const hash = await hashPassword(password, salt);
      const directHash = await bcrypt.hash(password + PEPPER, salt);

      expect(hash).toBe(directHash);
    });

    it.each([
      ["empty string", ""],
      ["single character", "a"],
      ["special characters only", "!@#$%^&*()"],
      ["unicode characters", "пароль123 密码 🔐"],
      ["very long password", "a".repeat(1000)],
      ["whitespace password", "   pass word   "],
    ])("should hash %s correctly", async (_, password) => {
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");

      const isValid = await comparePassword(password, hash, salt);
      expect(isValid).toBe(true);
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", async () => {
      const password = "testPassword123!";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await comparePassword(password, hash, salt);
      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "testPassword123!";
      const wrongPassword = "wrongPassword456!";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      const isValid = await comparePassword(wrongPassword, hash, salt);
      expect(isValid).toBe(false);
    });

    it("should be case sensitive", async () => {
      const password = "Password123";
      const wrongCase = "password123";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);

      expect(await comparePassword(password, hash, salt)).toBe(true);
      expect(await comparePassword(wrongCase, hash, salt)).toBe(false);
    });

    it("should ignore salt parameter (bcrypt extracts from hash)", async () => {
      const password = "test123";
      const correctSalt = generateSalt();
      const wrongSalt = generateSalt();

      const hash = await hashPassword(password, correctSalt);

      // Should work even with wrong salt passed
      const isValid = await comparePassword(password, hash, wrongSalt);
      expect(isValid).toBe(true);
    });

    it("should handle null/undefined inputs gracefully", async () => {
      // @ts-expect-error Testing invalid inputs
      expect(await comparePassword(null, "hash", "salt")).toBe(false);
    });

    it("should never accept empty hash", async () => {
      const isValid = await comparePassword("password", "", generateSalt());
      expect(isValid).toBe(false);
    });
  });
});

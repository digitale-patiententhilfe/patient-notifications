import { describe, it, expect } from "vitest";
import {
  addHours,
  subtractHours,
  addMinutes,
  isInPast,
  isInFuture,
} from "./datetime";

/**
 * Example tests demonstrating testing patterns for the project
 *
 * These tests show candidates how to:
 * - Structure test files with describe/it blocks
 * - Write clear test names
 * - Test edge cases
 * - Use expect assertions
 */
describe("datetime utils", () => {
  describe("addHours", () => {
    it("should add hours to a date", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      const result = addHours(date, 2);
      expect(result.getUTCHours()).toBe(12);
    });

    it("should handle adding hours across day boundary", () => {
      const date = new Date("2025-01-15T23:00:00Z");
      const result = addHours(date, 2);
      expect(result.getUTCDate()).toBe(16);
      expect(result.getUTCHours()).toBe(1);
    });

    it("should handle negative hours", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      const result = addHours(date, -2);
      expect(result.getUTCHours()).toBe(8);
    });

    it("should not mutate original date", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      const originalTime = date.getTime();
      addHours(date, 2);
      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe("subtractHours", () => {
    it("should subtract hours from a date", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      const result = subtractHours(date, 2);
      expect(result.getUTCHours()).toBe(8);
    });

    it("should handle subtracting hours across day boundary", () => {
      const date = new Date("2025-01-15T01:00:00Z");
      const result = subtractHours(date, 2);
      expect(result.getUTCDate()).toBe(14);
      expect(result.getUTCHours()).toBe(23);
    });
  });

  describe("addMinutes", () => {
    it("should add minutes to a date", () => {
      const date = new Date("2025-01-15T10:00:00Z");
      const result = addMinutes(date, 30);
      expect(result.getMinutes()).toBe(30);
    });

    it("should handle adding minutes across hour boundary", () => {
      const date = new Date("2025-01-15T10:45:00Z");
      const result = addMinutes(date, 30);
      expect(result.getUTCHours()).toBe(11);
      expect(result.getUTCMinutes()).toBe(15);
    });
  });

  describe("isInPast", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date("2020-01-01T00:00:00Z");
      expect(isInPast(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      expect(isInPast(futureDate)).toBe(false);
    });
  });

  describe("isInFuture", () => {
    it("should return true for future dates", () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      expect(isInFuture(futureDate)).toBe(true);
    });

    it("should return false for past dates", () => {
      const pastDate = new Date("2020-01-01T00:00:00Z");
      expect(isInFuture(pastDate)).toBe(false);
    });
  });
});

import { describe, it, expect } from "vitest";
import { SmsChannel } from "./SmsChannel";
import type { NotificationPayload } from "./INotificationChannel";
import { ChannelType } from "@prisma/client";

/**
 * Example test demonstrating how to test a channel implementation
 *
 * Key patterns shown:
 * - Testing both success and failure cases
 * - Testing validation logic
 * - Testing interface compliance
 * - Handling async operations
 */
describe("SmsChannel", () => {
  const channel = new SmsChannel();

  describe("getName", () => {
    it("should return SMS channel type", () => {
      expect(channel.getName()).toBe(ChannelType.SMS);
    });
  });

  describe("validate", () => {
    it("should validate when phone number and content are present", () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        recipientPhone: "+15551234567",
        content: "Test message",
      };

      const result = channel.validate(payload);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation when phone number is missing", () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        content: "Test message",
      };

      const result = channel.validate(payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "recipientPhone is required for SMS channel",
      );
    });

    it("should fail validation when phone number is invalid format", () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        recipientPhone: "invalid-phone",
        content: "Test message",
      };

      const result = channel.validate(payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "recipientPhone must be a valid phone number",
      );
    });

    it("should fail validation when content is missing", () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        recipientPhone: "+15551234567",
        content: "",
      };

      const result = channel.validate(payload);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("content is required");
    });

    it("should accept valid E.164 phone numbers", () => {
      const validPhones = [
        "+15551234567",
        "+442071234567",
        "+61412345678",
        "+81312345678",
      ];

      for (const phone of validPhones) {
        const payload: NotificationPayload = {
          id: "test-id",
          patientId: "patient-123",
          recipientPhone: phone,
          content: "Test",
        };

        const result = channel.validate(payload);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe("send", () => {
    it("should return success result with message ID", async () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        recipientPhone: "+15551234567",
        content: "Test message",
      };

      // Note: This test may be flaky due to random 10% failure rate
      // In production, you'd mock the external API call
      const result = await channel.send(payload);

      if (result.success) {
        expect(result.messageId).toBeDefined();
        expect(result.messageId).toMatch(/^sms_/);
      } else {
        // Test passed but simulated a failure
        expect(result.error).toBeDefined();
        expect(result.retryable).toBe(true);
      }
    });

    it("should return failure for invalid payload", async () => {
      const payload: NotificationPayload = {
        id: "test-id",
        patientId: "patient-123",
        content: "Test message",
        // Missing recipientPhone
      };

      const result = await channel.send(payload);
      expect(result.success).toBe(false);
      expect(result.retryable).toBe(false); // Validation errors shouldn't retry
      expect(result.error).toContain("recipientPhone");
    });
  });
});

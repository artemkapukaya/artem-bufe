import { describe, expect, it, beforeAll } from "vitest";
import {
  getOrCreateLoyaltyProfile,
  getLoyaltyProfile,
  addBonusPoints,
  getPointHistory,
} from "./db";

/**
 * Loyalty Program Tests
 * Tests for the customer loyalty system functionality
 */

describe("Loyalty Program", () => {
  const testUserId = Math.floor(Math.random() * 1000000) + 1000000; // Use unique ID to avoid conflicts

  beforeAll(async () => {
    // Clean up test data if it exists
    // In production, use proper test database isolation
  });

  describe("Loyalty Profile", () => {
    it("should create a new loyalty profile for a user", async () => {
      const profile = await getOrCreateLoyaltyProfile(testUserId);

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
      expect(profile.totalPoints).toBeGreaterThanOrEqual(0);
      expect(["bronze", "silver", "gold", "platinum"]).toContain(profile.level);
    });

    it("should retrieve existing loyalty profile", async () => {
      const profile = await getLoyaltyProfile(testUserId);

      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(testUserId);
      expect(profile?.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it("should return null for non-existent user", async () => {
      const profile = await getLoyaltyProfile(99999);
      expect(profile).toBeNull();
    });
  });

  describe("Bonus Points", () => {
    it("should add bonus points to user profile", async () => {
      const initialProfile = await getLoyaltyProfile(testUserId);
      const initialPoints = initialProfile?.totalPoints || 0;

      await addBonusPoints(testUserId, 100, "Test bonus");

      const updatedProfile = await getLoyaltyProfile(testUserId);
      expect(updatedProfile?.totalPoints).toBe(initialPoints + 100);
    });

    it("should record bonus points in transaction history", async () => {
      await addBonusPoints(testUserId, 50, "Test bonus 2");

      const history = await getPointHistory(testUserId);
      const bonusTransaction = history.find((t) => t.type === "bonus" && t.amount === 50);

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction?.description).toBe("Test bonus 2");
    });
  });

  describe("Level Calculation", () => {
    it("should calculate correct loyalty level based on points", async () => {
      // Add enough points to reach silver level (500+ points)
      const profile = await getLoyaltyProfile(testUserId);
      if (profile && profile.totalPoints < 500) {
        const pointsNeeded = 500 - profile.totalPoints;
        await addBonusPoints(testUserId, pointsNeeded, "Level up test");
      }

      const updatedProfile = await getLoyaltyProfile(testUserId);
      expect(["silver", "gold", "platinum"]).toContain(updatedProfile?.level);
    });
  });

  describe("Point History", () => {
    it("should retrieve point transaction history", async () => {
      const history = await getPointHistory(testUserId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it("should limit history results", async () => {
      const history = await getPointHistory(testUserId, 5);

      expect(history.length).toBeLessThanOrEqual(5);
    });
  });
});

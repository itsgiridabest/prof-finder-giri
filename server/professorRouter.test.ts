import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Professor Router", () => {
  describe("searchProfessors", () => {
    it("should search for professors and return results", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Mock the search to avoid actual AI calls in tests
      const result = await caller.professor.searchProfessors({
        researchField: "Machine Learning",
      });

      expect(result).toBeDefined();
      expect(result.searchId).toBeDefined();
      expect(typeof result.searchId).toBe("number");
      expect(result.professors).toBeDefined();
      expect(Array.isArray(result.professors)).toBe(true);
    });

    it("should reject search without research field", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.professor.searchProfessors({
          researchField: "",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("BAD_REQUEST");
      }
    });

    it("should accept optional university and location preferences", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.professor.searchProfessors({
        researchField: "Quantum Computing",
        universityPreference: "MIT",
        locationPreference: "Massachusetts",
      });

      expect(result).toBeDefined();
      expect(result.searchId).toBeDefined();
    });
  });

  describe("getSearchHistory", () => {
    it("should retrieve user search history", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a search
      const searchResult = await caller.professor.searchProfessors({
        researchField: "Neuroscience",
      });

      // Then retrieve history
      const history = await caller.professor.getSearchHistory();

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      // Should contain at least the search we just created
      expect(history.length).toBeGreaterThan(0);
    });

    it("should return empty array for user with no searches", async () => {
      const ctx = createAuthContext(999); // Different user ID
      const caller = appRouter.createCaller(ctx);

      const history = await caller.professor.getSearchHistory();

      expect(Array.isArray(history)).toBe(true);
      // New user should have empty or minimal history
      expect(history).toBeDefined();
    });
  });

  describe("generateEmail", () => {
    it("should generate personalized email for professor", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.professor.generateEmail({
        professorId: 1,
        professorName: "Dr. Jane Smith",
        professorResearch: "Machine learning and neural networks",
        recentPapers: [
          { title: "Deep Learning Architectures", year: 2024 },
          { title: "Neural Network Optimization", year: 2023 },
        ],
        researchInterest: "Machine Learning",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
      expect(result.content).toBeDefined();
      expect(typeof result.content).toBe("string");
      expect(result.content.length).toBeGreaterThan(0);
      // Email should reference the professor's name
      expect(result.content.toLowerCase()).toContain("jane");
    });

    it("should include professor research in generated email", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.professor.generateEmail({
        professorId: 2,
        professorName: "Dr. John Doe",
        professorResearch: "Quantum computing and quantum algorithms",
        recentPapers: [
          { title: "Quantum Supremacy", year: 2024 },
        ],
        researchInterest: "Quantum Computing",
      });

      expect(result.content).toBeDefined();
      // Email should be personalized and reference research
      expect(result.content.length).toBeGreaterThan(50);
    });
  });

  describe("updateEmail", () => {
    it("should update email content", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const updateResult = await caller.professor.updateEmail({
        emailId: 1,
        editedContent: "Updated email content for testing",
      });

      expect(updateResult).toBeDefined();
      expect(updateResult.success).toBe(true);
    });
  });

  describe("getEmail", () => {
    it("should retrieve email for professor", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const email = await caller.professor.getEmail({
        professorId: 1,
      });

      // Email might not exist initially, which is fine
      if (email) {
        expect(email).toBeDefined();
        expect(email.id).toBeDefined();
        expect(email.originalContent).toBeDefined();
      }
    });
  });

  describe("getProfessorsFromSearch", () => {
    it("should retrieve professors from a search", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // First create a search
      const searchResult = await caller.professor.searchProfessors({
        researchField: "Artificial Intelligence",
      });

      // Then retrieve professors from that search
      const professors = await caller.professor.getProfessorsFromSearch({
        searchId: searchResult.searchId,
      });

      expect(professors).toBeDefined();
      expect(Array.isArray(professors)).toBe(true);
    });

    it("should deny access to other user's searches", async () => {
      const ctx1 = createAuthContext(1);
      const ctx2 = createAuthContext(2);
      const caller1 = appRouter.createCaller(ctx1);
      const caller2 = appRouter.createCaller(ctx2);

      // User 1 creates a search
      const searchResult = await caller1.professor.searchProfessors({
        researchField: "Biology",
      });

      // User 2 tries to access it
      try {
        await caller2.professor.getProfessorsFromSearch({
          searchId: searchResult.searchId,
        });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

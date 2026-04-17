import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

describe("Smoke Tests - Core Functionality", () => {
  describe("Database Connection", () => {
    it("should connect to database", async () => {
      const db = await getDb();
      expect(db).toBeDefined();
    });
  });

  describe("LLM Integration", () => {
    it("should invoke LLM successfully", async () => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Say 'Hello' in one word.",
          },
        ],
      });

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      expect(response.choices[0].message).toBeDefined();
      expect(response.choices[0].message.content).toBeDefined();
    });
  });

  describe("JSON Schema Response", () => {
    it("should handle JSON schema responses", async () => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a JSON generator.",
          },
          {
            role: "user",
            content: 'Generate a simple JSON object with fields "name" and "age".',
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "person",
            strict: true,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                age: { type: "integer" },
              },
              required: ["name", "age"],
              additionalProperties: false,
            },
          },
        },
      });

      expect(response).toBeDefined();
      const content = response.choices[0].message.content;
      expect(typeof content).toBe("string");
      
      // Try to parse the JSON
      const parsed = JSON.parse(content as string);
      expect(parsed).toHaveProperty("name");
      expect(parsed).toHaveProperty("age");
    });
  });
});

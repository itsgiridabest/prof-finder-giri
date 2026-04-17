import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("OpenAI API Integration", () => {
  it("should successfully call OpenAI API with a simple prompt", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly one word.",
        },
        {
          role: "user",
          content: "Say the word 'success'",
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]).toBeDefined();
    expect(response.choices[0].message).toBeDefined();
    expect(response.choices[0].message.content).toBeDefined();
    expect(typeof response.choices[0].message.content).toBe("string");
    // The response should contain some text
    expect(response.choices[0].message.content.length).toBeGreaterThan(0);
  });

  it("should handle structured JSON responses", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant designed to output JSON. Extract the name and field from the text.",
        },
        {
          role: "user",
          content:
            "Dr. Jane Smith is a professor of Computer Science at MIT.",
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "professor_info",
          strict: true,
          schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Professor name" },
              field: { type: "string", description: "Research field" },
            },
            required: ["name", "field"],
            additionalProperties: false,
          },
        },
      },
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);

    const content = response.choices[0].message.content;
    expect(typeof content).toBe("string");

    // Parse and validate the JSON structure
    const parsed = JSON.parse(content);
    expect(parsed).toHaveProperty("name");
    expect(parsed).toHaveProperty("field");
    expect(typeof parsed.name).toBe("string");
    expect(typeof parsed.field).toBe("string");
  });
});

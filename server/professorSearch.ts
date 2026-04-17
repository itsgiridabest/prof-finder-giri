import { invokeLLM } from "./_core/llm";

export interface ProfessorData {
  name: string;
  university: string;
  department?: string;
  researchInterests: string;
  recentPapers: Array<{
    title: string;
    year: number;
    url?: string;
  }>;
  contactEmail?: string;
  profileUrl?: string;
}

/**
 * Use AI to search for professors in a research field
 * Returns structured professor data that can be saved to database
 */
export async function searchProfessorsWithAI(
  researchField: string,
  universityPreference?: string,
  locationPreference?: string
): Promise<ProfessorData[]> {
  const locationContext = locationPreference ? ` in ${locationPreference}` : "";
  const universityContext = universityPreference
    ? ` at ${universityPreference}`
    : "";

  const prompt = `Find 5-8 real professors who are actively researching in the field of "${researchField}"${universityContext}${locationContext}. 
  
For each professor, provide:
1. Full name
2. University/Institution
3. Department
4. Current research interests (2-3 sentences)
5. 2-3 recent publications (with title, year, and if available, a URL)
6. Contact email (if publicly available)
7. University profile URL (if available)

Focus on finding professors with:
- Active research programs in the specified field
- Recent publications (last 3 years)
- Clear research interests aligned with the search topic
- Publicly available contact information

Return the data in a structured JSON format.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert academic researcher. Your task is to identify real professors working in specific research fields. Provide accurate, verifiable information about their research interests and recent publications. Always search for real, currently active professors.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "professor_search_results",
        strict: true,
        schema: {
          type: "object",
          properties: {
            professors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Full name of the professor",
                  },
                  university: {
                    type: "string",
                    description: "University or institution name",
                  },
                  department: {
                    type: "string",
                    description: "Department or faculty",
                  },
                  researchInterests: {
                    type: "string",
                    description: "Current research interests and focus areas",
                  },
                  recentPapers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "Paper title",
                        },
                        year: {
                          type: "integer",
                          description: "Publication year",
                        },
                        url: {
                          type: "string",
                          description: "URL to paper if available",
                        },
                      },
                      required: ["title", "year"],
                      additionalProperties: false,
                    },
                    description: "Recent publications",
                  },
                  contactEmail: {
                    type: "string",
                    description: "Email address if publicly available",
                  },
                  profileUrl: {
                    type: "string",
                    description: "University profile URL",
                  },
                },
                required: [
                  "name",
                  "university",
                  "researchInterests",
                  "recentPapers",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["professors"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response format from AI");
  }

  const parsed = JSON.parse(content);
  return parsed.professors;
}

export interface GiriProfile {
  fullName?: string;
  university?: string;
  major?: string;
  year?: string;
  gpa?: string;
  researchInterests?: string;
  skills?: string;
  pastExperience?: string;
}

/**
 * Generate a personalized cold email for a professor
 * References their specific research work and Giri's profile
 */
export async function generatePersonalizedEmail(
  professorName: string,
  professorResearch: string,
  recentPapers: Array<{ title: string; year: number }>,
  researchInterest: string,
  giriProfile?: GiriProfile
): Promise<string> {
  const papersContext = recentPapers
    .slice(0, 2)
    .map((p) => `"${p.title}" (${p.year})`)
    .join(" and ");

  const profileContext = giriProfile
    ? `\nGiri's Background:\n${
        giriProfile.fullName ? `- Name: ${giriProfile.fullName}\n` : ""
      }${
        giriProfile.university ? `- University: ${giriProfile.university}\n` : ""
      }${
        giriProfile.major ? `- Major: ${giriProfile.major}\n` : ""
      }${
        giriProfile.year ? `- Year: ${giriProfile.year}\n` : ""
      }${
        giriProfile.gpa ? `- GPA: ${giriProfile.gpa}\n` : ""
      }${
        giriProfile.skills ? `- Skills: ${giriProfile.skills}\n` : ""
      }${
        giriProfile.pastExperience ? `- Experience: ${giriProfile.pastExperience}\n` : ""
      }${
        giriProfile.researchInterests ? `- Research Interests: ${giriProfile.researchInterests}` : ""
      }`
    : "";

  const prompt = `Write a professional cold email from Giri to Professor ${professorName}.${profileContext}

The email should:
1. Be warm, genuine, and respectful (not generic)
2. Reference 1-2 of their specific recent papers: ${papersContext}
3. Show genuine interest in their research on: ${professorResearch}
4. Explain why Giri is interested in their work (related to: ${researchInterest})
5. If available, mention relevant experience or skills that align with the professor's work
6. Express interest in potential research opportunities or collaboration
7. Be concise (under 200 words)
8. Include a professional closing with Giri's name

The tone should be:
- Respectful of the professor's time
- Specific and personalized (not a template)
- Enthusiastic about their research
- Professional but personable

Do not include:
- Generic phrases like "I am writing to express my interest"
- Multiple paragraphs of background about Giri
- Requests for immediate responses or meetings`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at writing personalized, professional cold emails that reference specific research work. Your emails are warm, genuine, and have a high response rate because they show genuine interest in the recipient's work.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response format from AI");
  }

  return content;
}


/**
 * Calculate match score between professor's research and Giri's interests
 * Returns a score from 0-100 with reasoning
 */
export async function calculateMatchScore(
  professorResearch: string,
  professorPapers: string,
  giriResearchInterests: string,
  giriSkills: string
): Promise<{ score: number; reasoning: string }> {
  const prompt = `Analyze how well this professor's research aligns with the student's interests.

Professor's Research:
${professorResearch}

Professor's Recent Papers:
${professorPapers}

Student's Research Interests:
${giriResearchInterests}

Student's Skills:
${giriSkills}

Provide a match score from 0-100 where:
- 90-100: Excellent match, very aligned research interests and skills
- 75-89: Good match, significant overlap in research areas
- 60-74: Moderate match, some relevant research overlap
- 40-59: Fair match, tangential research interests
- 0-39: Poor match, minimal alignment

Return a JSON object with:
{
  "score": <number 0-100>,
  "reasoning": "<brief explanation of the match>"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert at matching student research interests with professor research areas. Provide objective, data-driven assessments.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "match_score",
        strict: true,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Match score 0-100" },
            reasoning: { type: "string", description: "Explanation of the match" },
          },
          required: ["score", "reasoning"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response format from AI");
  }

  const parsed = JSON.parse(content);
  return {
    score: Math.min(100, Math.max(0, parsed.score)),
    reasoning: parsed.reasoning,
  };
}

/**
 * Generate email with specific tone
 */
export async function generateEmailWithTone(
  professorName: string,
  professorResearch: string,
  recentPapers: Array<{ title: string; year: number }>,
  researchInterest: string,
  tone: "formal" | "friendly" | "concise",
  giriProfile?: GiriProfile
): Promise<string> {
  const papersContext = recentPapers
    .slice(0, 2)
    .map((p) => `"${p.title}" (${p.year})`)
    .join(" and ");

  const profileContext = giriProfile
    ? `\nGiri's Background:\n${
        giriProfile.fullName ? `- Name: ${giriProfile.fullName}\n` : ""
      }${
        giriProfile.university ? `- University: ${giriProfile.university}\n` : ""
      }${
        giriProfile.major ? `- Major: ${giriProfile.major}\n` : ""
      }${
        giriProfile.year ? `- Year: ${giriProfile.year}\n` : ""
      }${
        giriProfile.gpa ? `- GPA: ${giriProfile.gpa}\n` : ""
      }${
        giriProfile.skills ? `- Skills: ${giriProfile.skills}\n` : ""
      }${
        giriProfile.pastExperience ? `- Experience: ${giriProfile.pastExperience}\n` : ""
      }${
        giriProfile.researchInterests ? `- Research Interests: ${giriProfile.researchInterests}` : ""
      }`
    : "";

  const toneInstructions = {
    formal: `Write in a professional, academic tone. Use formal language and structure. Keep it concise and respectful of the professor's time.`,
    friendly: `Write in a warm, personable tone while remaining professional. Show enthusiasm for their work. Be conversational but still respectful.`,
    concise: `Write a very brief, to-the-point email. Get straight to the point in 2-3 short paragraphs. No unnecessary pleasantries.`,
  };

  const prompt = `Write a professional cold email from Giri to Professor ${professorName}.${profileContext}

Tone: ${toneInstructions[tone]}

The email should:
1. Be warm, genuine, and respectful (not generic)
2. Reference 1-2 of their specific recent papers: ${papersContext}
3. Show genuine interest in their research on: ${professorResearch}
4. Explain why Giri is interested in their work (related to: ${researchInterest})
5. If available, mention relevant experience or skills that align with the professor's work
6. Express interest in potential research opportunities or collaboration
7. Be concise (under 200 words)
8. Include a professional closing with Giri's name

Do not include:
- Generic phrases like "I am writing to express my interest"
- Multiple paragraphs of background about Giri
- Requests for immediate responses or meetings`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at writing personalized, professional cold emails that reference specific research work. Your emails are warm, genuine, and have a high response rate because they show genuine interest in the recipient's work.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response format from AI");
  }

  return content;
}

/**
 * Generate follow-up email
 */
export async function generateFollowUpEmail(
  professorName: string,
  originalEmailSnippet: string,
  tone: "formal" | "friendly" | "concise",
  daysElapsed: number
): Promise<string> {
  const toneInstructions = {
    formal: `Use formal, professional language. Politely reference the original email and express continued interest.`,
    friendly: `Use a warm, friendly tone. Casually reference the original email and express enthusiasm.`,
    concise: `Keep it very brief and direct. Just a quick reminder of interest.`,
  };

  const prompt = `Write a polite follow-up email from Giri to Professor ${professorName}.

Original email reference:
${originalEmailSnippet}

Days since original email: ${daysElapsed}

Tone: ${toneInstructions[tone]}

The follow-up email should:
1. Politely reference the original email
2. Reiterate interest in their research
3. Not be pushy or demanding
4. Be brief (2-3 sentences for concise, 1 paragraph for others)
5. Express understanding if they're busy
6. Leave the door open for future collaboration
7. Include a professional closing with Giri's name

Do not:
- Sound desperate or demanding
- Repeat the entire original email
- Ask for an immediate response`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an expert at writing polite, professional follow-up emails that maintain interest without being pushy.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (typeof content !== "string") {
    throw new Error("Invalid response format from AI");
  }

  return content;
}

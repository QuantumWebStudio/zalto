import { countWords, extractTitle, stripCodeFences } from "./text";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GeneratedPost {
  title: string;
  content: string;
  wordCount: number;
}

export type GenerateOutcome = { ok: true; post: GeneratedPost } | { ok: false; error: string; status: number };

function systemPrompt(companyName: string): string {
  return `You are a senior content writer producing a blog post for ${companyName}'s company blog. Write in a professional, confident, informative tone suitable for a business audience. Never mention that you are an AI, a language model, or that the content was generated — write as a human subject-matter expert would.`;
}

function userPrompt(topic: string): string {
  return `Write a blog post on the topic: "${topic}".

Requirements:
- Approximately 1000 words.
- Start with a single leading line formatted as "# Title" containing a compelling, specific headline (not the raw topic text restated).
- Structure the body with 4 to 6 "##" subheadings.
- Include at least one bulleted or numbered list where it aids readability.
- Write in well-organized Markdown paragraphs, professional tone, no filler, no disclaimers about being AI-generated.
- Do not wrap any part of the response in code fences (no \`\`\`).
- Do not include a conclusion heading literally titled "Conclusion" — prefer a more specific closing subheading.`;
}

/** Calls Groq's OpenAI-compatible chat-completions endpoint and parses the result into a post. */
export async function generatePost(topic: string, companyName: string): Promise<GenerateOutcome> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: "Server is missing GROQ_API_KEY. Add it to your environment and restart the server.",
    };
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  let groqResponse: Response;
  try {
    groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt(companyName || "the company") },
          { role: "user", content: userPrompt(topic) },
        ],
        temperature: 0.7,
      }),
    });
  } catch {
    return {
      ok: false,
      status: 502,
      error: "Could not reach the Groq API. Check your network connection and try again.",
    };
  }

  if (!groqResponse.ok) {
    if (groqResponse.status === 429) {
      return {
        ok: false,
        status: 429,
        error: "Groq rate limit reached. Wait a moment before retrying this topic.",
      };
    }

    let detail = "";
    try {
      const errorBody = (await groqResponse.json()) as { error?: { message?: string } };
      detail = errorBody.error?.message ?? "";
    } catch {
      // response body wasn't JSON; fall through with no extra detail
    }

    return {
      ok: false,
      status: groqResponse.status,
      error: `Groq API error (${groqResponse.status})${detail ? `: ${detail}` : "."}`,
    };
  }

  interface GroqChatCompletion {
    choices?: { message?: { content?: string } }[];
  }

  const completion = (await groqResponse.json()) as GroqChatCompletion;
  const raw = completion.choices?.[0]?.message?.content;

  if (!raw) {
    return { ok: false, status: 502, error: "Groq returned an empty response for this topic." };
  }

  const cleaned = stripCodeFences(raw);
  const { title, body: content } = extractTitle(cleaned, topic);
  const wordCount = countWords(content);

  return { ok: true, post: { title, content, wordCount } };
}

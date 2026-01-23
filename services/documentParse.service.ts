import { generativeAi } from "../configs/gemini.config";

export interface ExtractInfo {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: string[];
  experience: string;
}

export async function parseDocument(
  docText: string,
  retry = 1
): Promise<ExtractInfo> {
  try {
    const model = generativeAi.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const prompt = `
You are a strict JSON API.
You MUST return ONLY valid JSON.
No markdown. No explanation. No text.

Extract these fields from this resume:
- name
- email
- phone
- skills (array of strings)
- education (array of strings)
- experience (string)

Return EXACTLY this format:
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [],
  "experience": ""
}

Resume:
${docText}
`;

    const res = await model.generateContent(prompt);
    const raw = res.response.text().trim();

    const json = extractJson(raw);

    return {
      name: json.name || "",
      email: json.email || "",
      phone: json.phone || "",
      skills: Array.isArray(json.skills) ? json.skills : [],
      education: Array.isArray(json.education) ? json.education : [],
      experience: json.experience || ""
    };
  } catch (err) {
    console.error("Resume parsing failed:", err);

    if (retry > 0) {
      console.warn(" Retrying resume parsing...");
      return parseDocument(docText, retry - 1);
    }

    throw new Error("Failed to parse document with AI");
  }
}

function extractJson(text: string): any {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("No JSON found in AI response");
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    throw new Error("Invalid JSON returned by AI");
  }
}

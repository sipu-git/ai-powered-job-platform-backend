import { generativeAi } from "../configs/gemini.config";
import { JobModel } from "../models/jobs.model";
import type { ExtractInfo } from "./documentParse.service";

export async function scoreResume(
    jobId: string,
    resume: ExtractInfo
) {
    const job = await JobModel.findById(jobId);
    if (!job) throw new Error("Job not found");

    resume = resume || ({} as ExtractInfo);

    const weight = {
        skills: Number(job.scoringWeights?.skills || 0.4),
        experience: Number(job.scoringWeights?.experience || 0.3),
        education: Number(job.scoringWeights?.education || 0.2),
        aiMatch: Number(job.scoringWeights?.aiMatch || 0.1)
    };

    const requiredSkills: string[] = job.requiredSkills || [];
    const resumeSkills: string[] = resume.skills || [];
    const matchedSkills = resumeSkills.filter(skill => requiredSkills.some(convert => convert.toLowerCase().includes(skill.toLowerCase())))

    const skillRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0;

    const resumeExperience = extractYearsFromExperience(resume.experience || []);
    const minExperience = job.experiences ? parseInt(job.experiences) : 0;

    const experienceRatio = minExperience <= 0 ? 1 : Math.min(resumeExperience / minExperience, 1);

    // -------- EDUCATION SCORE

    const resumeEducationText = normalizeEducation(flattenEducation(resume.education || []));

    const jobEducationText = normalizeEducation(flattenEducation(job.education || []));
    const educationRatio = (resumeEducationText && jobEducationText && (resumeEducationText.includes(jobEducationText) || jobEducationText.includes(resumeEducationText)) ? 1 : 0)

    let aiRatio = 0;
    try {
        const rawAiScore = await getAiScore(job, resume, 100);
        aiRatio = Math.min(rawAiScore / 100, 1);
    } catch (err) {
        console.warn("AI scoring failed, defaulting to 0");
        aiRatio = 0;
    }

    const breakDownRatio = {
        skills: Math.round(skillRatio * weight.skills * 100),
        experience: Math.round(experienceRatio * weight.experience * 100),
        education: Math.round(educationRatio * weight.education * 100),
        aiMatch: Math.round(aiRatio * weight.aiMatch * 100)
    }
    const totalScore = Math.min(
        100, (breakDownRatio.skills + breakDownRatio.experience + breakDownRatio.education + breakDownRatio.aiMatch)
    );


    let status: "submitted" | "Reviewing" | "Shortlisted" | "rejected" | "hired" = "submitted";

    if (totalScore >= 70) status = "Shortlisted";
    else if (totalScore >= 50) status = "Reviewing";
    else status = "rejected";

    return { totalScore, status, breakDownRatio };
}

function extractYearsFromExperience(
    experience: {
        company: string;
        designation: string;
        startDate?: string;
        endDate?: string;
    }[]
): number {
    if (!Array.isArray(experience)) return 0;

    let totalYears = 0;

    for (const exp of experience) {
        const start = parseYear(exp.startDate);
        const end = parseYear(exp.endDate) || new Date().getFullYear();

        if (start && end && end >= start) {
            totalYears += end - start;
        }
    }

    return totalYears;
}

// Convert education objects into searchable text
function flattenEducation(
    education: any
): string {
    if (typeof education === "string") {
        return education;
    }
    if (!Array.isArray(education)) {
        return "";
    }
    return education
        .map((e) => {
            if (!e || typeof e !== "object") return "";

            return `${e.course || ""} ${e.schoolOrCollege || ""}`;
        })
        .join(" ")
        .trim();
}

function normalizeEducation(text: string) {
    return text
        .toLowerCase()
        // Engineering / Tech
        .replace(/b\.?tech/g, "bachelor of technology")
        .replace(/m\.?tech/g, "master of technology")
        .replace(/b\.?e/g, "bachelor of engineering")
        // Computer / IT
        .replace(/bca/g, "bachelor of computer application")
        .replace(/mca/g, "master of computer application")
        .replace(/cse/g, "computer science")
        .replace(/cs/g, "computer science")
        .replace(/it/g, "information technology")
        // Business / Arts
        .replace(/bba/g, "bachelor of business administration")
        .replace(/mba/g, "master of business administration")
        .replace(/ba/g, "bachelor of arts")
        .replace(/ma/g, "master of arts")

        // Cleanup
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function parseYear(value?: string): number | null {
    if (!value) return null;

    const match = value.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
}

// ---------------- AI SCORING ----------------
async function getAiScore(
    job: any,
    resume: ExtractInfo,
    maxScore: number
) {
    const model = generativeAi.getGenerativeModel({
        model: "gemini-3-flash-preview"
    });

    const educationText = flattenEducation(
        resume.education || []
    );

    const experienceText = (resume.experience || [])
        .map(e =>
            `${e.designation || ""} at ${e.company || ""}`
        )
        .join(", ");

    const prompt = `
You are an ATS scoring system.
Return ONLY a number between 0 and ${maxScore}.

Job:
Title: ${job.title}
Required Skills: ${(job.requiredSkills || []).join(", ")}
Education: ${job.education || "Any"}
Min Experience: ${job.minExperience || "Any"}

Resume:
Skills: ${(resume.skills || []).join(", ")}
Experience: ${experienceText || "Not provided"}
Education: ${educationText || "Not provided"}

Score based on relevance.
`;

    const res = await model.generateContent(prompt);
    const score = parseFloat(res.response.text().trim());

    return isNaN(score) ? 0 : score;
}

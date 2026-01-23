import { generativeAi } from "../configs/gemini.config";
import { JobModel } from "../models/jobs.model";
import type { ExtractInfo } from "./documentParse.service";

export async function scoreResume(
    jobId: string,
    resume: ExtractInfo
) {
    const job = await JobModel.findById(jobId);
    if (!job) throw new Error("Job not found");

    const breakdown = {
        skills: 0,
        experience: 0,
        education: 0,
        aiMatch: 0
    };

    const matchedSkills = resume.skills.filter(skill =>
        job.requiredSkills.some(js =>
            js.toLowerCase().includes(skill.toLowerCase())
        )
    );

    breakdown.skills =
        (matchedSkills.length / job.requiredSkills.length) *
        job.scoringWeights.skills;

    const years = extractYears(resume.experience);
    const minExperience = job.minExperience ? parseInt(job.minExperience) : 0;
    if (years >= minExperience) {
        breakdown.experience = job.scoringWeights.experience;
    } else {
        breakdown.experience =
            (years / minExperience) *
            job.scoringWeights.experience;
    }

    if (
        job.education &&
        resume.education.join(" ").toLowerCase().includes(
            job.education.toLowerCase()
        )
    ) {
        breakdown.education = job.scoringWeights.education;
    }

    breakdown.aiMatch = await getAiScore(job, resume);

    const totalScore = Object.values(breakdown).reduce(
        (a, b) => a + b,
        0
    );

    let status: "SHORTLISTED" | "REJECTED" | "REVIEW" = "REJECTED";
    if (totalScore >= 70) status = "SHORTLISTED";
    else if (totalScore >= 50) status = "REVIEW";

    return { totalScore, status, breakdown };
}

function extractYears(text: string): number {
    const match = text.match(/(\d+)\s+years?/i);
    return match && match[1] ? parseInt(match[1]) : 0;
}

async function getAiScore(job: any, resume: ExtractInfo) {
    const model = generativeAi.getGenerativeModel({
        model: "gemini-3-flash-preview"
    });

    const prompt = `
You are an ATS scoring system.
Score this resume from 0 to ${job.scoringWeights.aiMatch}
based on relevance to this job.

Job:
${job.title}
Skills: ${job.requiredSkills.join(", ")}

Resume:
Skills: ${resume.skills.join(", ")}
Experience: ${resume.experience}
Education: ${resume.education.join(", ")}

Return ONLY a number.
`;

    const res = await model.generateContent(prompt);
    const score = parseFloat(res.response.text().trim());
    return isNaN(score) ? 0 : score;
}

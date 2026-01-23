import { uploadToS3, downloadFromS3 } from "../services/s3.service";
import { createRawData } from "../lib/generateDocId";
import { parseDocument } from "../services/documentParse.service";
import { extractTextFromFileBuffer } from "../services/textExtractor.service";
import { scoreResume } from "../services/resumeScoring.service";
import { ApplicationModel } from "../models/application.model";
import { JobModel } from "../models/jobs.model";
import { notifyCandidate } from "../services/notification.service";

export const parseResume = async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume file required"
            });
        }
        const s3Key = await uploadToS3(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        const fileBuffer = await downloadFromS3(s3Key);
        const text = await extractTextFromFileBuffer(
            fileBuffer,
            req.file.originalname
        );

        const extractedData = await parseDocument(text);

        return res.status(201).json({ message: "Resume parsed successfully", data: extractedData });

    } catch (error) {
        console.error("Parse resume failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to parse resume"
        });
    }
}
export const applyForJob = async (req: any, res: any) => {
    try {
        const { jobId, formData } = req.body;

        if (!formData || !jobId) {
            return res.status(400).json({
                success: false,
                message: "formData and jobId are required"
            });
        }

        const job = await JobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

       const savedData = await createRawData({
            originalFileName:"user-edited",
            ...formData
       })
        const result = await scoreResume(jobId, formData);

        const application = await ApplicationModel.create({
            documentId: savedData.documentId,
            jobId,
            applicantEmail: formData.email,
            score: result.totalScore,
            breakdown: result.breakdown,
            status:
                result.status === "SHORTLISTED"
                    ? "Shortlisted"
                    : result.status === "REJECTED"
                        ? "Rejected"
                        : "Reviewing"
        });

        await notifyCandidate(
            formData.email,
            result.status,
            job.title
        );

        return res.status(201).json({
            success: true,
            data: {
                autoFilledForm: formData,
                application
            },
            message: "Application submitted and evaluated successfully"
        });
    } catch (error) {
        console.error("Apply job failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to apply for job"
        });
    }
};

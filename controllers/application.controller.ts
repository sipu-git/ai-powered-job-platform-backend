import { uploadToS3, downloadFromS3 } from "../services/s3.service";
import { createRawData } from "../lib/generateDocId";
import { parseDocument } from "../services/documentParse.service";
import { extractTextFromFileBuffer } from "../services/textExtractor.service";
import { scoreResume } from "../services/resumeScoring.service";
import { ApplicationModel } from "../models/application.model";
import { JobModel } from "../models/jobs.model";
import { notifyCandidate } from "../services/notification.service";

export const applyForJob = async (req: any, res: any) => {
  try {
    const { jobId } = req.body;

    if (!req.file || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Resume file and jobId are required"
      });
    }

    const job = await JobModel.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
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

    const saved = await createRawData({
      originalFileName: req.file.originalname,
      ...extractedData
    });

    const result = await scoreResume(jobId, extractedData);

    const application = await ApplicationModel.create({
      documentId: saved.documentId,
      jobId,
      applicantEmail: extractedData.email,
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
      extractedData.email,
      result.status,
      job.title
    );

    return res.status(201).json({
      success: true,
      data: {
        autoFilledForm: extractedData,
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

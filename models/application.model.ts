import type { Document } from "mongoose";
import mongoose from "mongoose";

export interface IApplication extends Document {
    documentId: string;
    jobId: string;
    applicantEmail: string;
    score: number;
    breakdown: {
        skills: number;
        experience: number;
        education: number;
        aiMatch: number;
    };
    status: "submitted" | "Reviewing" | "Shortlisted" | "rejected" | "hired";
    appliedDate: Date;
}
const applicationSchema = new mongoose.Schema<IApplication>({
    documentId: { type: String, required: true },
    jobId: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    score: { type: Number, required: true },
    breakdown: {
        skills: { type: Number, required: true },
        experience: { type: Number, required: true },
        education: { type: Number, required: true },
        aiMatch: { type: Number, required: true },
    },
    status: { type: String, enum: ["submitted", "Reviewing", "Shortlisted", "rejected", "hired"], default: "submitted" },
    appliedDate: { type: Date, default: Date.now },
}, { timestamps: true });
export const ApplicationModel = mongoose.model<IApplication>("Application", applicationSchema);
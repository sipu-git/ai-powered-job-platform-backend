import type { Document } from "mongoose";
import mongoose from "mongoose";

export interface IApplication extends Document {
    documentId: string;
    jobId: mongoose.Types.ObjectId;
    applicantName: string;
    applicantEmail: string;
    score: number;
    breakdown: {
        skills: number;
        experience: number;
        education: number;
        aiMatch: number;
    };
    resumeData: {
        name?: string;
        email?: string;
        phone?: string;
        skills?: string[];
        education?: [{
            schoolOrCollege: string;
            course: string;
            startYear?: string;
            endYear?: string;
        }];
        experience?: [{
            company: string;
            designation: string;
            startDate?: string;
            endDate?: string;
        }];
    };
    status: "submitted" | "Reviewing" | "Shortlisted" | "rejected" | "hired";
    appliedDate: Date;
}
const applicationSchema = new mongoose.Schema<IApplication>({
    documentId: { type: String, required: true },
    jobId: { type: mongoose.Types.ObjectId, ref: "Job", required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    score: { type: Number, required: true },
    breakdown: {
        skills: { type: Number, required: true },
        experience: { type: Number, required: true },
        education: { type: Number, required: true },
        aiMatch: { type: Number, required: true },
    },
    resumeData: {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        skills: {
            type: [String],
            default: []
        },
        education: [
            {
                schoolOrCollege: { type: String, default: "" },
                course: { type: String, default: "" },
                startYear: { type: String, default: "" },
                endYear: { type: String, default: "" }
            }
        ],

        experience: [
            {
                company: { type: String, default: "" },
                designation: { type: String, default: "" },
                startDate: { type: String, default: "" },
                endDate: { type: String, default: "" }
            }
        ]
    },
    status: { type: String, enum: ["submitted", "Reviewing", "Shortlisted", "rejected", "hired"], default: "submitted" },
    appliedDate: { type: Date, default: Date.now },
}, { timestamps: true });
applicationSchema.index({ jobId: 1 });

export const ApplicationModel = mongoose.model<IApplication>("Application", applicationSchema);
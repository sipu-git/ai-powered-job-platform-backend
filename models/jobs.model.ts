import mongoose, { Mongoose, Schema, type Document } from "mongoose";

export interface IJob extends Document {
    title: string;
    requiredSkills: string[];
    experiences?: string;
    department?: string;
    description: string;
    responsibilities?: string[];
    requirements?: string[];
    empType: string;
    education?: string[];
    company?: string;
    scoringWeights: {
        skills: number;
        experience: number;
        education: number;
        aiMatch: number;
    };
    location: string;
    salary?: string;
    deadline?: Date;
    vacancies?: number;
    status: 'Active' | 'Expiring Soon' | 'Expired';
    autoClosed: boolean;
    closedReason?: string;
    tags?: string[];
    applications?: number;
}
const jobSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        requiredSkills: {
            type: [String],
            required: true,
            default: []
        },
        applicationId: {
            type: mongoose.Types.ObjectId,
            ref: "Application",
            required: true
        },
        experiences: {
            type: String
        },

        department: {
            type: String,
            enum: ["IT Department", "HR Resource", "Finance", "Administration"],
            default: "IT Department",
            required: true
        },

        description: {
            type: String
        },

        responsibilities: {
            type: [String],
            default: [],
            required: true
        },

        empType: {
            type: String,
            enum: ["Full Time", "Contractual", "Part Time"],
            required: true
        },

        education: {
            type: [String],
            default: [],
            required: true
        },
        requirements: {
            type: [String],
            default: [],
            required: true
        },
        company: {
            type: String
        },

        scoringWeights: {
            skills: {
                type: Number,
                default: 0.4,
                min: 0,
                max: 1
            },
            experience: {
                type: Number,
                default: 0.3,
                min: 0,
                max: 1
            },
            education: {
                type: Number,
                default: 0.2,
                min: 0,
                max: 1
            },
            aiMatch: {
                type: Number,
                default: 0.1,
                min: 0,
                max: 1
            }
        },

        location: {
            type: String,
            enum: ["Delhi", "Mumbai", "Hyderabad", "Bangalore", "Chennai", "Pune", "Gujurat", "Punjab", "Gurgaon", "Noida", "Bhubaneswar", "Kolkata"],
            required: true
        },

        salary: {
            type: String
        },

        deadline: {
            type: Date
        },

        vacancies: {
            type: Number,
            min: 1
        },

        status: {
            type: String,
            enum: ["Active", "Expiring Soon", "Expired"],
            default: "Active"
        },

        autoClosed: {
            type: Boolean,
            default: true
        },

        closedReason: {
            type: String
        },

        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);
jobSchema.virtual("applications", {
    ref: "Application",
    localField: "_id",
    foreignField: "jobId",
    count: true
})
jobSchema.virtual("totalApplications", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
});

jobSchema.set("toJSON", { virtuals: true })
jobSchema.set("toObject", { virtuals: true })
export const JobModel = mongoose.model<IJob>("Job", jobSchema);
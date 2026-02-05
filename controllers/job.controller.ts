import type { Request, Response } from "express";
import { JobModel } from "../models/jobs.model";
import { emitGlobal } from "../configs/socket";

export const createJob = async (req: Request, res: Response) => {
    try {
        const { title, requiredSkills, experiences, description, requirements,
            education, department, location, scoringWeights,
            responsibilities, empType, company, salary, deadline, vacancies, tags
        } = req.body;

        if (!title || !department || !location || !empType) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const parseArray = (field: string[] | string | undefined) => {
            if (Array.isArray(field)) return field;
            if (typeof field === "string") {
                return field.split(",").map(i => i.trim()).filter(Boolean);
            }
            return [];
        };

        const skillsArray = parseArray(requiredSkills);
        const responsibilitiesArray = parseArray(responsibilities);
        const requirementsArray = parseArray(requirements);
        const educationArray = parseArray(education);

        if (!skillsArray.length || !responsibilitiesArray.length || !requirementsArray.length) {
            return res.status(400).json({
                success: false,
                message: "Skills, responsibilities, and requirements must contain at least one item"
            });
        }

        const job = new JobModel({
            title,
            requiredSkills: skillsArray,
            responsibilities: responsibilitiesArray,
            requirements: requirementsArray,
            education: educationArray,
            experiences,
            department,
            description,
            empType,
            company,
            location,
            salary,
            deadline,
            vacancies,
            scoringWeights: {
                skills: scoringWeights?.skills,
                experience: scoringWeights?.experience,
                education: scoringWeights?.education,
                aiMatch: scoringWeights?.aiMatch
            },
            tags
        });

        await job.save();

        emitGlobal("jobsUpdated", {
            type: "JOB_CREATED",
            title: job.title,
            jobId: job._id.toString(),
            timestamp: new Date().toISOString()
        });

        return res.status(201).json({
            success: true,
            message: "Job created successfully",
            data: job
        });
    } catch (error) {
        console.error("Create Job Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const getJobs = async (req: Request, res: Response) => {
    try {
        const jobs = await JobModel.find().populate("applications")
            .select("-scoringWeights")
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No jobs found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs
        });
    } catch (error) {
        console.error("Get Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const searchJobs = async (req: Request, res: Response) => {
    try {
        const { title, skills, location, department, empType } = req.query;

        const query: any = {};

        if (title) {
            query.title = { $regex: new RegExp(title as string, "i") };
        }

        if (location) {
            query.location = { $regex: new RegExp(location as string, "i") };
        }

        if (department) {
            query.department = department;
        }

        if (empType) {
            query.empType = empType;
        }

        if (skills) {
            const skillsArray = (skills as string)
                .split(",")
                .map((skill) => skill.trim());
            query.requiredSkills = { $in: skillsArray };
        }

        const jobs = await JobModel.find(query).populate("applications").populate({
            path: "totalApplications",
            select: "applicantName applicantEmail status resumeData appliedAt",
        })
            .select("-scoringWeights")
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No jobs found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs
        });
    } catch (error) {
        console.error("Search Jobs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }
        const job = await JobModel.findById(id).populate("applications").populate({
            path: "totalApplications",
            select: "applicantName applicantEmail status resumeData appliedAt",
        }).select("-scoringWeights");

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Job fetched successfully",
            data: job
        });
    } catch (error) {
        console.error("Get Job By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const viewLatestJob = async (req: Request, res: Response) => {
    try {
        const jobsLimit = Number(req.query.limit) || 2;
        const fetchRecentJobs = await JobModel.find().sort({ appliedDate: -1, createdAt: -1 }).limit(jobsLimit).populate("applications").populate({
            path: "totalApplications",
            select: "applicantName applicantEmail status resumeData appliedAt",
        })
        return res.status(200).json({
            message: "Recent jobs fetched successfully",
            data: fetchRecentJobs
        });
    } catch (error) {
        console.error("Error fetching recent applications", error);
        return res.status(500).json({
            message: "Failed to fetch recent applications", error
        });
    }
}
export const modifyJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "JOB ID is required!" })
        }
        let updateJob = { ...req.body };

        if (updateJob.requiredSkills) {
            updateJob.requiredSkills = Array.isArray(updateJob.requiredSkills)
                ? updateJob.requiredSkills
                : typeof updateJob.requiredSkills === "string"
                    ? updateJob.requiredSkills.split(",").map((s: string) => s.trim())
                    : [];
        }
        const modifyJobById = await JobModel.findByIdAndUpdate(
            id,
            { $set: updateJob },
            { new: true, runValidators: true }
        ).select("-scoringWeights");

        if (!modifyJobById) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        emitGlobal("jobsUpdated", {
            type: "JOB_UPDATED",
            title: modifyJobById.title,
            jobId: modifyJobById._id.toString(),
            status: modifyJobById.status,
            timestamp: new Date().toISOString()
        });
        return res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: modifyJobById
        });
    }
    catch (error) {
        console.error("Update Job Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const deleteJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "Job ID is required" });
        }
        const deletedJob = await JobModel.findByIdAndDelete(id).populate("applications").select("-scoringWeights");

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }
        emitGlobal("jobsUpdated", {
            type: "JOB_DELETED",
            title: deletedJob.title,
            jobId: deletedJob._id.toString(),
            timestamp: new Date().toISOString()
        });
        return res.status(200).json({
            success: true,
            message: "Job deleted successfully",
            data: deletedJob
        });
    } catch (error) {
        console.error("Delete Job Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
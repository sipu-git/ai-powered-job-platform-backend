import type { Request, Response } from "express";
import { JobModel } from "../models/jobs.model";

export const createJob = async (req:Request,res:Response) =>{
     try {
        const {title,requiredSkills,minExperience,description,education,location,scoringWeights,salaryRange,postedDate,applyLink,tags} = req.body;
        if(!title || !requiredSkills || !description || !scoringWeights || !applyLink){
            return res.status(400).json({success:false,message:"Missing required fields"});
        }
        const job = new JobModel({
            title,
            requiredSkills,
            minExperience,
            description,
            location,
            postedDate,
            education,
            scoringWeights,
            applyLink,
            salaryRange,
            tags
        });
        await job.save();
        return res.status(201).json({success:true,message:"Job created successfully",data:job});
     } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({success:false,message:"Internal server error"});
     }
}

export const getJobs = async (req:Request,res:Response) =>{
    try {
        const jobs = await JobModel.find().select("-scoringWeights");;
        if(!jobs || jobs.length === 0){
            return res.status(404).json({success:false,message:"No jobs found"});
        }
        return res.status(200).json({success:true,data:jobs,message:"Jobs fetched successfully" });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

export const searchJobs = async (req:Request,res:Response) =>{
    try {
        const {title,skills} = req.query;
        const query:any = {};
        if(title){
            query.title = { $regex: new RegExp(title as string, "i") };
        }   
        if(skills){
            const skillsArray = (skills as string).split(",").map(skill => skill.trim());
            query.requiredSkills = { $all: skillsArray };
        }
        const jobs = await JobModel.find(query).select("-scoringWeights");
        if(!jobs || jobs.length === 0){
            return res.status(404).json({success:false,message:"No jobs found"});
        }
        return res.status(200).json({success:true,data:jobs,message:"Jobs fetched successfully" });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}

export const getJobById = async (req:Request,res:Response) =>{
    try {
        const {id} = req.params;
        const job =  await JobModel.findById(id).select("-scoringWeights");
        if(!job){
            return res.status(404).json({success:false,message:"Job not found"});
        }
        return res.status(200).json({success:true,data:job,message:"Job fetched successfully" });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({success:false,message:"Internal server error"});
    }
}
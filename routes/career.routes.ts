import express from 'express'
import multer from 'multer';
import { applyForJob } from '../controllers/application.controller';
import { createJob, getJobById, getJobs, searchJobs } from '../controllers/job.controller';

const router = express.Router()
const uploadDoc =  multer({storage:multer.memoryStorage()})

router.post("/apply-job",uploadDoc.single("document"),applyForJob);
router.post("/add-job",createJob);
router.get("/get-jobs",getJobs);
router.get("/get-job/:id",getJobById)
router.get("/search-jobs",searchJobs);
export default router;
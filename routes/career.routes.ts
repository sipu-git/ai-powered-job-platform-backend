import express from 'express'
import multer from 'multer';
import { applyForJob, parseResume } from '../controllers/application.controller';
import { createJob, getJobById, getJobs, searchJobs } from '../controllers/job.controller';

const router = express.Router()
const uploadDoc = multer({ storage: multer.memoryStorage() })

router.post("/parse-resume", uploadDoc.single("document"), parseResume)
router.post("/apply-job", applyForJob);
router.post("/add-job", createJob);
router.get("/get-jobs", getJobs);
router.get("/get-job/:id", getJobById)
router.get("/search-jobs", searchJobs);
export default router;
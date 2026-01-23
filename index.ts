import express from 'express';
import dotenv from 'dotenv';
import DocRoutes from './routes/career.routes';
import cors from 'cors';
import { connectDB } from './configs/db.config';

dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/career", DocRoutes)

connectDB()
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`The server is running on PORT ${PORT}`);
})
import { connectDB } from "../configs/db.config";
import { CounterModel } from "../models/counter.model";
import RawDataModel from "../models/data.model";

export async function createRawData(data: {
  originalFileName: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  education: string[];
  experience: string;
}) {
  await connectDB();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "rawdata" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const documentId = `DOC-${counter.seq}`;

  return RawDataModel.create({
    documentId,
    ...data,
  });
}

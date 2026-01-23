import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IRawData extends Document {
    documentId: string;
    originalFileName: string;
    name: string;
    email: string;
    phone: string;
    skills: string[];
    education: string[];
    experience: string;
    createdAt: Date;
    updatedAt: Date;
}

const RawDataSchema: Schema<IRawData> = new Schema({
    documentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    originalFileName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        default: "",
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        default: ""
    },
    phone: {
        type: String,
        trim: true,
        default: "",
    },
    skills: {
        type: [String],
        default: []
    },
    education: {
        type: [String],
        default: [],
    },
    experience: {
        type: String,
        default: ""
    }
},{timestamps:true})

const RawDataModel:Model<IRawData> = mongoose.models.RawData || mongoose.model("RawData",RawDataSchema) 
export default RawDataModel;
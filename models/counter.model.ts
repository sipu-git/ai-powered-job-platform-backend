import mongoose, { type Model, Schema, type Document } from "mongoose";

export interface ICouter extends Document{
    name:string;
    seq:number;
}

const CounterSchema:Schema<ICouter> = new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    seq:{
        type:Number,
        default:0
    }
})
export const CounterModel:Model<ICouter> = mongoose.models.Counter || mongoose.model("Counter",CounterSchema) 

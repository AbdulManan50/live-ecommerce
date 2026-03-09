import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({

stream:{
type:mongoose.Schema.Types.ObjectId,
ref:"Stream"
},

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

text:String

},{timestamps:true})

export default mongoose.models.Message ||
mongoose.model("Message",MessageSchema)
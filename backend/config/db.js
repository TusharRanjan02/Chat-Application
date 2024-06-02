import mongoose from "mongoose";

const connectDB = async() => {
    mongoose.connect(process.env.MONGO_URI)
    .then((res)=>{
        console.log("DB connected successfully")
    })
    .catch((err)=>{
        console.log(err)
    })
};

export default connectDB;
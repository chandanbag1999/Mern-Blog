import express from 'express';
import cookieParser from 'cookie-parser';



const app = express();

app.use(express.json());
app.use(cookieParser());



// route import
import userRouter from "./routes/user.route.js"

// route decleration
app.use("/api/v1/users", userRouter);



export default app
import express from "express";
import studentRouter from "./features/user/student.routes";
// import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());

// Mount the Feature-Driven Router
app.use("/api/v1/students", studentRouter);

// Global Error Handler catches all next(error) triggers from controllers perfectly
// app.use(globalErrorHandler);
export default app;

import express from "express";
import studentRouter from "./features/user/student.routes";
import bookingRouter from "./features/booking/booking.routes";
import intructorRouter from "./features/instructor/instructor.routes";
import founderRouter from "./features/founder/founder.route";
import branchRouter from "./features/branch/branch.route";
// import { globalErrorHandler } from './middleware/error.middleware';

const app = express();

app.use(express.json());

// Mount the Feature-Driven Router
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/instructors", intructorRouter);
app.use("/api/v1/founders", founderRouter);
app.use("/api/v1/branches", branchRouter);

// Global Error Handler catches all next(error) triggers from controllers perfectly
// app.use(globalErrorHandler);
export default app;

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();

connectDB();

const app: express.Application = express();

export default app;

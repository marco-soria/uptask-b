import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';

dotenv.config();

connectDB();

const app: express.Application = express();
app.use(cors(corsConfig));
//app.use(cors())  //accept all origins

app.use(express.json());

//Routes
app.use('/api/projects', projectRoutes);

export default app;

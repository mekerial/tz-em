import dotenv from 'dotenv';
import * as process from 'node:process';
import express from 'express';
import http from 'http';
import cors from 'cors';
import {runDB} from '../db/db';
import {TicketsRouter} from '../routers/tickets.route';
dotenv.config();

const app = express();
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const PORT = process.env.PORT || 3000;

app.use(cors({
    credentials: true
}));

app.use(express.json());
app.use('/', TicketsRouter);


const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server listened on http://localhost:${PORT}/`)
});

runDB(MONGO_URL).catch(err => console.log(err));


// app.js
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

const express = require('express');
const {db} = require('./database');
const homeRoutes = require('./routes/home.routes');
const authRoutes = require('./routes/auth.routes')


const app = express();

app.use(express.json());
app.use('/', homeRoutes);
app.use('/auth',authRoutes)

module.exports = app;
// app.js
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

const express = require('express');
const {db} = require('./database');
const homeRoutes = require('./routes/home.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());
app.use('/', homeRoutes);
app.use('/auth',authRoutes);
app.use(errorHandler);

module.exports = app;
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ... rest of the code ... 
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
const env = require('dotenv').config;
const supabase = require('./db.js')
const PORT = 5000;


app.listen(5000, () => console.log(`Server has started on port: ${PORT}`));

module.exports = app
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/class', require('./routes/class.routes'));
app.use('/api/student', require('./routes/student.routes'));
app.use('/api/score', require('./routes/score.routes'));
app.use('/api/reflection', require('./routes/reflection.routes'));
app.use("/api/awards", require('./routes/award.routes'));
app.use("/api", require('./routes/weeklyChallenge.routes'));
app.use("/api", require("./routes/team.routes"));

// Health check
app.get('/health', (_, res) => res.json({ status: 'OK' }));

module.exports = app;

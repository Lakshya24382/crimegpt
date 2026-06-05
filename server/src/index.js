const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'CrimeGPT API running ✅', time: new Date() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/cases/:caseId/persons', require('./routes/persons'));
app.use('/api/cases/:caseId/evidence', require('./routes/evidence'));
app.use('/api/cases/:caseId/sections', require('./routes/sections'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, badge_number, role, station, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO officers (name, badge_number, role, station, password_hash)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, badge_number, role, station`,
      [name, badge_number, role || 'IO', station, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Badge number already exists' });
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { badge_number, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM officers WHERE badge_number = $1', [badge_number]
    );
    const officer = result.rows[0];
    if (!officer) return res.status(404).json({ error: 'Officer not found' });

    const valid = await bcrypt.compare(password, officer.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: officer.id, name: officer.name, role: officer.role, badge_number: officer.badge_number },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, officer: { id: officer.id, name: officer.name, role: officer.role, station: officer.station } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
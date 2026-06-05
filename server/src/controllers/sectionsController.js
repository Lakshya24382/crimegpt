const pool = require('../config/db');

exports.getSections = async (req, res) => {
  const result = await pool.query('SELECT * FROM case_sections WHERE case_id = $1', [req.params.caseId]);
  res.json(result.rows);
};

exports.addSection = async (req, res) => {
  const { caseId } = req.params;
  const { act, section_number, section_title, description, ai_suggested } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO case_sections (case_id, act, section_number, section_title, description, ai_suggested)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [caseId, act, section_number, section_title, description, ai_suggested || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSection = async (req, res) => {
  await pool.query('DELETE FROM case_sections WHERE id = $1', [req.params.sectionId]);
  res.json({ message: 'Section removed' });
};
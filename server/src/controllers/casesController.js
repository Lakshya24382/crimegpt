const pool = require('../config/db');

exports.getAllCases = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, o.name as officer_name 
       FROM cases c LEFT JOIN officers o ON c.assigned_officer_id = o.id
       ORDER BY c.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseResult = await pool.query(
      `SELECT c.*, o.name as officer_name
       FROM cases c LEFT JOIN officers o ON c.assigned_officer_id = o.id
       WHERE c.id = $1`, [id]
    );
    if (!caseResult.rows[0]) return res.status(404).json({ error: 'Case not found' });

    const [persons, sections, evidenceList, diary] = await Promise.all([
      pool.query('SELECT * FROM persons WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM case_sections WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM evidence WHERE case_id = $1', [id]),
      pool.query('SELECT * FROM diary_entries WHERE case_id = $1 ORDER BY entry_date ASC', [id]),
    ]);

    res.json({
      ...caseResult.rows[0],
      persons: persons.rows,
      sections: sections.rows,
      evidence: evidenceList.rows,
      diary: diary.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCase = async (req, res) => {
  const {
    fir_number, station, incident_date, incident_time,
    incident_location, incident_description
  } = req.body;
  try {
    const year = new Date().getFullYear();
    const count = await pool.query('SELECT COUNT(*) FROM cases');
    const case_number = `CR-${year}-${String(Number(count.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO cases 
        (case_number, fir_number, station, incident_date, incident_time, incident_location, incident_description, assigned_officer_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [case_number, fir_number, station, incident_date, incident_time, incident_location, incident_description, req.officer.id]
    );

    // Auto diary entry
    await pool.query(
      `INSERT INTO diary_entries (case_id, officer_id, entry_type, description)
       VALUES ($1, $2, 'FIR', $3)`,
      [result.rows[0].id, req.officer.id, `FIR registered. Case number: ${case_number}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCase = async (req, res) => {
  const { id } = req.params;
  const { incident_description, status, incident_location } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cases SET incident_description=$1, status=$2, incident_location=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [incident_description, status, incident_location, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const pool = require('../config/db');

exports.getPersons = async (req, res) => {
  const result = await pool.query('SELECT * FROM persons WHERE case_id = $1', [req.params.caseId]);
  res.json(result.rows);
};

exports.addPerson = async (req, res) => {
  const { caseId } = req.params;
  const { role, name, father_name, age, gender, address, mobile, id_proof_type, id_proof_number, physical_description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO persons (case_id, role, name, father_name, age, gender, address, mobile, id_proof_type, id_proof_number, physical_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [caseId, role, name, father_name, age, gender, address, mobile, id_proof_type, id_proof_number, physical_description]
    );

    await pool.query(
      `INSERT INTO diary_entries (case_id, officer_id, entry_type, description)
       VALUES ($1,$2,$3,$4)`,
      [caseId, req.officer.id, `${role}_ADDED`, `${role}: ${name} added to case`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePerson = async (req, res) => {
  const { personId } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  try {
    const result = await pool.query(
      `UPDATE persons SET ${setClause} WHERE id=$${keys.length + 1} RETURNING *`,
      [...values, personId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
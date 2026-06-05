const pool = require('../config/db');

exports.getEvidence = async (req, res) => {
  const result = await pool.query('SELECT * FROM evidence WHERE case_id = $1', [req.params.caseId]);
  res.json(result.rows);
};

exports.addEvidence = async (req, res) => {
  const { caseId } = req.params;
  const { item_description, quantity, seized_from, seized_at, seized_date, muddemal_number } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO evidence (case_id, item_description, quantity, seized_from, seized_at, seized_date, muddemal_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [caseId, item_description, quantity, seized_from, seized_at, seized_date, muddemal_number]
    );

    await pool.query(
      `INSERT INTO diary_entries (case_id, officer_id, entry_type, description)
       VALUES ($1,$2,'EVIDENCE_SEIZURE',$3)`,
      [caseId, req.officer.id, `Evidence seized: ${item_description} from ${seized_from}`]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
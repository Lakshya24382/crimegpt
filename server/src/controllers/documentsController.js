const pool = require('../config/db');

// Helper to get full case data
async function getFullCase(caseId) {
  const caseResult = await pool.query(
    `SELECT c.*, o.name as officer_name, o.badge_number, o.station as officer_station
     FROM cases c LEFT JOIN officers o ON c.assigned_officer_id = o.id
     WHERE c.id = $1`, [caseId]
  );
  if (!caseResult.rows[0]) throw new Error('Case not found');

  const [persons, sections, evidenceList] = await Promise.all([
    pool.query('SELECT * FROM persons WHERE case_id = $1', [caseId]),
    pool.query('SELECT * FROM case_sections WHERE case_id = $1', [caseId]),
    pool.query('SELECT * FROM evidence WHERE case_id = $1 ORDER BY created_at ASC', [caseId]),
  ]);

  return {
    ...caseResult.rows[0],
    persons: persons.rows,
    sections: sections.rows,
    evidence: evidenceList.rows,
    victim: persons.rows.find(p => p.role === 'VICTIM'),
    accused: persons.rows.filter(p => p.role === 'ACCUSED'),
    witnesses: persons.rows.filter(p => p.role === 'WITNESS'),
  };
}

function formatDate(d) {
  if (!d) return '___________';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function sectionsList(sections) {
  if (!sections.length) return 'Sections to be determined';
  return sections.map(s => `${s.act} Section ${s.section_number}${s.section_title ? ` (${s.section_title})` : ''}`).join(', ');
}

// ── DOCUMENT GENERATORS ──────────────────────────────────────

function generateChargesheet(c) {
  return `
GUJARAT POLICE
PURVANI CHARGESHEET (PRELIMINARY CHARGE SHEET)
═══════════════════════════════════════════════════════════════

Case Number      : ${c.case_number}
FIR Number       : ${c.fir_number || '—'}
Police Station   : ${c.station || c.officer_station || '—'}
Date of FIR      : ${formatDate(c.created_at)}

SECTIONS APPLIED : ${sectionsList(c.sections)}

───────────────────────────────────────────────────────────────
COMPLAINANT / VICTIM DETAILS
───────────────────────────────────────────────────────────────
Name             : ${c.victim?.name || '—'}
Father's Name    : ${c.victim?.father_name || '—'}
Age / Gender     : ${c.victim?.age || '—'} / ${c.victim?.gender || '—'}
Address          : ${c.victim?.address || '—'}
Mobile           : ${c.victim?.mobile || '—'}

───────────────────────────────────────────────────────────────
ACCUSED DETAILS
───────────────────────────────────────────────────────────────
${c.accused.length === 0 ? 'No accused added yet.' : c.accused.map((a, i) => `
Accused ${i + 1}
Name             : ${a.name}
Father's Name    : ${a.father_name || '—'}
Age / Gender     : ${a.age || '—'} / ${a.gender || '—'}
Address          : ${a.address || '—'}
ID Proof         : ${a.id_proof_type || '—'} - ${a.id_proof_number || '—'}
`).join('\n')}

───────────────────────────────────────────────────────────────
INCIDENT DETAILS
───────────────────────────────────────────────────────────────
Date & Time      : ${formatDate(c.incident_date)} ${c.incident_time || ''}
Location         : ${c.incident_location || '—'}

Description:
${c.incident_description || '—'}

───────────────────────────────────────────────────────────────
SEIZED PROPERTY / EVIDENCE
───────────────────────────────────────────────────────────────
${c.evidence.length === 0 ? 'No evidence recorded.' : c.evidence.map((e, i) =>
  `${i + 1}. ${e.item_description} | Qty: ${e.quantity || '—'} | Muddemal No: ${e.muddemal_number || '—'} | Seized From: ${e.seized_from || '—'}`
).join('\n')}

───────────────────────────────────────────────────────────────

Investigating Officer  : ${c.officer_name || '—'}
Badge Number           : ${c.badge_number || '—'}
Date                   : ${formatDate(new Date())}

Signature: _______________________
(Investigating Officer)
  `.trim();
}

function generateRemandRequest(c) {
  const accused = c.accused[0] || {};
  return `
GUJARAT POLICE
REMAND REQUEST LETTER (POLICE CUSTODY)
═══════════════════════════════════════════════════════════════

To,
The Hon'ble Judicial Magistrate,
${c.station || '—'}, Ahmedabad.

Subject: Application for Police Custody Remand

Your Honour,

I, ${c.officer_name || '___________'}, Investigating Officer, ${c.station || '___________'} Police Station,
respectfully submit this application for police custody remand of the accused in the matter of:

Case Number      : ${c.case_number}
FIR Number       : ${c.fir_number || '—'}
Sections         : ${sectionsList(c.sections)}

ACCUSED DETAILS:
Name             : ${accused.name || '—'}
Father's Name    : ${accused.father_name || '—'}
Age              : ${accused.age || '—'}
Address          : ${accused.address || '—'}

GROUNDS FOR REMAND:
The accused has been arrested in connection with the above-mentioned case. Police custody
remand is required for the following reasons:

1. Recovery of stolen property / weapons used in the commission of the offence.
2. Identification of co-accused and other witnesses.
3. Reconstruction of the scene of crime.
4. Detailed interrogation regarding the modus operandi.

Brief Facts:
${c.incident_description || '—'}

It is therefore respectfully prayed that this Hon'ble Court may be pleased to grant
police custody remand of the accused for a period of ______ days.

Place: ${c.station || '—'}
Date : ${formatDate(new Date())}

Yours faithfully,

_______________________________
${c.officer_name || '—'}
Investigating Officer
Badge No: ${c.badge_number || '—'}
${c.station || '—'} Police Station
  `.trim();
}

function generateSeizureReceipt(c) {
  return `
GUJARAT POLICE
SEIZURE RECEIPT (PANCHNAMA)
═══════════════════════════════════════════════════════════════

Case Number      : ${c.case_number}
FIR Number       : ${c.fir_number || '—'}
Police Station   : ${c.station || '—'}
Date             : ${formatDate(new Date())}

This is to certify that the following articles/property have been seized by the
undersigned officer in the presence of witnesses:

───────────────────────────────────────────────────────────────
SEIZED ARTICLES
───────────────────────────────────────────────────────────────
${c.evidence.length === 0 ? 'No items recorded.' : c.evidence.map((e, i) => `
Sr. No.          : ${i + 1}
Description      : ${e.item_description}
Quantity         : ${e.quantity || '—'}
Muddemal No.     : ${e.muddemal_number || '—'}
Seized From      : ${e.seized_from || '—'}
Place of Seizure : ${e.seized_at || '—'}
Date of Seizure  : ${formatDate(e.seized_date)}
`).join('\n───────────────────────\n')}

───────────────────────────────────────────────────────────────
WITNESSES TO SEIZURE
───────────────────────────────────────────────────────────────
${c.witnesses.length === 0 ? 'No witnesses recorded.' : c.witnesses.map((w, i) =>
  `${i + 1}. ${w.name}, ${w.address || '—'}`
).join('\n')}

Seizing Officer  : ${c.officer_name || '—'}
Badge Number     : ${c.badge_number || '—'}

Signature of Seizing Officer: _______________________

Signature of Person from whom seized: _______________________
  `.trim();
}

function generateMedicalLetter(c) {
  const person = c.victim || c.accused[0] || {};
  return `
GUJARAT POLICE
MEDICAL TREATMENT LETTER
═══════════════════════════════════════════════════════════════

Date             : ${formatDate(new Date())}
Case Number      : ${c.case_number}

To,
The Medical Officer,
Civil Hospital / Government Hospital,
Ahmedabad.

Subject: Request for Medical Examination

Sir/Madam,

Please examine and provide medical treatment to the following person in connection
with the above-mentioned police case:

Name             : ${person.name || '—'}
Age / Gender     : ${person.age || '—'} / ${person.gender || '—'}
Father's Name    : ${person.father_name || '—'}
Address          : ${person.address || '—'}
Status in Case   : ${c.victim ? 'Victim' : 'Accused'}

Brief circumstances:
${c.incident_description || '—'}

Please provide:
1. Medical examination report with details of injuries (if any)
2. Treatment administered
3. Fitness/Unfitness certificate
4. Medico-legal certificate (MLC)

Your earliest cooperation is solicited.

Yours faithfully,

_______________________________
${c.officer_name || '—'}
Investigating Officer, Badge No: ${c.badge_number || '—'}
${c.station || '—'} Police Station
Phone: ___________
  `.trim();
}

function generateCourtCustodyLetter(c) {
  const accused = c.accused[0] || {};
  return `
GUJARAT POLICE
COURT CUSTODY LETTER
═══════════════════════════════════════════════════════════════

Date             : ${formatDate(new Date())}

To,
The Hon'ble Court of Judicial Magistrate,
Ahmedabad, Gujarat.

Case Number      : ${c.case_number}
FIR Number       : ${c.fir_number || '—'}
Sections         : ${sectionsList(c.sections)}
Police Station   : ${c.station || '—'}

ACCUSED:
Name             : ${accused.name || '—'}
Age / Gender     : ${accused.age || '—'} / ${accused.gender || '—'}
Address          : ${accused.address || '—'}

Sir/Madam,

The above-named accused has been arrested on ${formatDate(new Date())} in connection
with the above-mentioned case. He/She is being produced before the Hon'ble Court
as required under the provisions of BNSS.

The accused is requested to be remanded to judicial custody pending further
investigation. All relevant documents including the FIR, arrest memo, and
personal search memo are enclosed herewith.

Yours faithfully,

_______________________________
${c.officer_name || '—'}
Investigating Officer, Badge No: ${c.badge_number || '—'}
${c.station || '—'} Police Station
  `.trim();
}

function generateAccusedPanchanama(c) {
  return `
GUJARAT POLICE
ACCUSED PANCHANAMA
═══════════════════════════════════════════════════════════════

Case Number      : ${c.case_number}
Date             : ${formatDate(new Date())}
Police Station   : ${c.station || '—'}

${c.accused.length === 0 ? 'No accused recorded.' : c.accused.map((a, i) => `
ACCUSED ${i + 1}
═══════════════════
Full Name        : ${a.name}
Father's Name    : ${a.father_name || '—'}
Age              : ${a.age || '—'}
Gender           : ${a.gender || '—'}
Address          : ${a.address || '—'}
Mobile           : ${a.mobile || '—'}
ID Proof Type    : ${a.id_proof_type || '—'}
ID Proof Number  : ${a.id_proof_number || '—'}

Physical Description:
${a.physical_description || 'Not recorded.'}

Personal Property found on person at time of arrest:
___________________________________________________
___________________________________________________

Arrest Date/Time : ${formatDate(new Date())}
Place of Arrest  : ___________________________
`).join('\n')}

Panchanama Witnesses:
1. ___________________________
2. ___________________________

Panchanama conducted by:
_______________________________
${c.officer_name || '—'}, Badge No: ${c.badge_number || '—'}
  `.trim();
}

function generateFaceIdentificationForm(c) {
  return `
GUJARAT POLICE
ACCUSED FACE IDENTIFICATION FORM
═══════════════════════════════════════════════════════════════

Case Number      : ${c.case_number}
FIR Number       : ${c.fir_number || '—'}
Date             : ${formatDate(new Date())}
Police Station   : ${c.station || '—'}

${c.accused.length === 0 ? 'No accused recorded.' : c.accused.map((a, i) => `
ACCUSED ${i + 1}
═══════════════════
Full Name        : ${a.name}
Age / Gender     : ${a.age || '—'} / ${a.gender || '—'}

PHYSICAL FEATURES:
Height           : ___________
Build            : ___________
Complexion       : ___________
Hair             : ___________
Eyes             : ___________
Distinguishing
Marks/Tattoos    : ${a.physical_description || '___________'}

Photograph Attached: [ ] Yes  [ ] No
Photo Reference No : ___________

Identified By    : ___________
Identification
Date             : ___________
`).join('\n')}

Prepared By:
_______________________________
${c.officer_name || '—'}, Badge No: ${c.badge_number || '—'}
${c.station || '—'} Police Station
  `.trim();
}

// ── MAIN CONTROLLER ──────────────────────────────────────────

const DOC_GENERATORS = {
  CHARGESHEET: generateChargesheet,
  REMAND_REQUEST: generateRemandRequest,
  SEIZURE_RECEIPT: generateSeizureReceipt,
  MEDICAL_LETTER: generateMedicalLetter,
  COURT_CUSTODY: generateCourtCustodyLetter,
  ACCUSED_PANCHANAMA: generateAccusedPanchanama,
  FACE_IDENTIFICATION: generateFaceIdentificationForm,
};

exports.generateDocument = async (req, res) => {
  const { caseId, docType } = req.params;

  if (!DOC_GENERATORS[docType]) {
    return res.status(400).json({ error: `Unknown document type: ${docType}` });
  }

  try {
    const caseData = await getFullCase(caseId);
    const content = DOC_GENERATORS[docType](caseData);

    // Log document generation
    await pool.query(
      `INSERT INTO documents (case_id, doc_type, generated_by) VALUES ($1, $2, $3)`,
      [caseId, docType, req.officer.id]
    );

    // Add diary entry
    await pool.query(
      `INSERT INTO diary_entries (case_id, officer_id, entry_type, description)
       VALUES ($1, $2, 'DOCUMENT_GENERATED', $3)`,
      [caseId, req.officer.id, `Document generated: ${docType}`]
    );

    res.json({ docType, content, caseNumber: caseData.case_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDocumentHistory = async (req, res) => {
  const { caseId } = req.params;
  try {
    const result = await pool.query(
      `SELECT d.*, o.name as officer_name FROM documents d
       LEFT JOIN officers o ON d.generated_by = o.id
       WHERE d.case_id = $1 ORDER BY d.created_at DESC`,
      [caseId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
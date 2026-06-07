const pool = require('../config/db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  });
  const raw = completion.choices[0].message.content.trim();
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

exports.suggestSections = async (req, res) => {
  const { caseId, description } = req.body;

  if (!description || description.length < 20) {
    return res.status(400).json({ error: 'Incident description too short' });
  }

  try {
    const sections = await callGroq(`
You are an expert in Indian criminal law specializing in BNS (Bharatiya Nyaya Sanhita), 
BNSS (Bharatiya Nagarik Suraksha Sanhita), and BSA (Bharatiya Sakshya Adhiniyam) 
which replaced IPC, CrPC, and Evidence Act in 2023.

Analyze this FIR/incident description and return ONLY a valid JSON array.
No markdown, no explanation, no backticks. Just the raw JSON array.

Format:
[
  {
    "act": "BNS",
    "section_number": "103",
    "section_title": "Murder",
    "description": "Applies because the accused caused death with intention."
  }
]

Return 3-7 sections. Prioritize BNS sections, include BNSS/BSA where relevant.

Incident description: ${description}
    `);

    if (!Array.isArray(sections)) {
      return res.status(500).json({ error: 'Unexpected AI response format' });
    }

    let added = 0;
    for (const s of sections) {
      const exists = await pool.query(
        `SELECT id FROM case_sections WHERE case_id=$1 AND act=$2 AND section_number=$3`,
        [caseId, s.act, s.section_number]
      );
      if (exists.rows.length > 0) continue;

      await pool.query(
        `INSERT INTO case_sections (case_id, act, section_number, section_title, description, ai_suggested)
         VALUES ($1, $2, $3, $4, $5, true)`,
        [caseId, s.act, s.section_number, s.section_title, s.description]
      );
      added++;
    }

    await pool.query(
      `INSERT INTO diary_entries (case_id, officer_id, entry_type, description)
       VALUES ($1, $2, 'AI_SECTIONS', $3)`,
      [caseId, req.officer.id, `AI suggested ${added} legal sections based on incident description`]
    );

    res.json({ added, sections });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.suggestJudgments = async (req, res) => {
  const { description, sections } = req.body;

  if (!description) return res.status(400).json({ error: 'Description required' });

  try {
    const sectionsList = sections?.map(s => `${s.act} Section ${s.section_number}`).join(', ') || '';

    const judgments = await callGroq(`
You are an expert in Indian criminal law and Supreme Court/High Court judgments.

Return ONLY a valid JSON array. No markdown, no explanation, no backticks. Just raw JSON.

Format:
[
  {
    "case_name": "State of Maharashtra v. Mohd. Sajid Husain",
    "court": "Supreme Court of India",
    "year": "2008",
    "citation": "AIR 2008 SC 201",
    "relevance": "Establishes that circumstantial evidence must form a complete chain."
  }
]

Return 3-5 landmark judgments most relevant to the facts and sections.

Incident: ${description}
Applicable sections: ${sectionsList}
    `);

    res.json({ judgments });
  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
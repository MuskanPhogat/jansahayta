const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeIssue(userText, lang = 'hi') {
  const langInstruction = lang === 'hi'
    ? 'Respond ONLY in simple Hindi (Devanagari script). Avoid legal jargon.'
    : 'Respond ONLY in simple English. Avoid legal jargon.';

  const prompt = `You are a legal aid assistant for India. A citizen has described their problem below.

Your job:
1. Identify the CATEGORY of their legal issue (one of: tenant_rights, domestic_violence, labour_dispute, consumer_fraud, land_dispute, criminal, family_law, govt_scheme, workplace_harassment, other)
2. Explain their LEGAL RIGHTS in simple language (3-4 sentences max)
3. Name the RELEVANT LAW that protects them
4. Set urgent to true if they need help within 48 hours

${langInstruction}

IMPORTANT: Always include a disclaimer that this is AI-generated information, not professional legal advice, and the user should consult a real legal aid center to confirm.

Citizen's problem: "${userText}"

Respond ONLY in this exact JSON format, nothing else, no markdown formatting:
{
  "category": "tenant_rights",
  "rights_summary": "your explanation here",
  "relevant_law": "name of the law",
  "urgent": false,
  "disclaimer": "this is general information, not legal advice"
}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { analyzeIssue };
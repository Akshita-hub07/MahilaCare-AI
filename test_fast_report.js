import { LocalAIProvider } from './src/services/providers/localAIProvider.js';

async function testFastReport() {
  const provider = new LocalAIProvider();
  const t0 = Date.now();
  const res = await provider.generateCompletion({
    prompt: `Analyze this medical report in JSON format:
Title: Complete Blood Count (CBC)
Content: Hemoglobin 10.2 g/dL (LOW), Hematocrit 31% (LOW)

Return JSON with this schema:
\`\`\`json
{
  "summary": "1-2 sentence plain language summary",
  "keyFindings": ["Finding 1", "Finding 2"],
  "extractedValues": [
    { "parameter": "Hemoglobin", "value": "10.2 g/dL", "status": "LOW" },
    { "parameter": "Hematocrit", "value": "31%", "status": "LOW" }
  ],
  "nextSteps": ["Step 1", "Step 2"],
  "whenToSeekCare": "Guidance on when to see doctor",
  "suggestsFollowup": true
}
\`\`\``,
    systemInstruction: `You are MahilaCare AI, a concise conversational health assistant. Return grounded JSON response.`,
    maxTokens: 350,
    temperature: 0.2
  });

  const duration = (Date.now() - t0) / 1000;
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Output:\n`, res.text);
}

testFastReport();

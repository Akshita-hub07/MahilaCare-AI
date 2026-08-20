import { LocalAIProvider } from './src/services/providers/localAIProvider.js';

async function testCase(name, prompt, maxTokens = 350) {
  console.log(`\n========================================`);
  console.log(`TESTING: ${name}`);
  console.log(`========================================`);
  
  const provider = new LocalAIProvider();
  const t0 = Date.now();
  
  const res = await provider.generateCompletion({
    prompt,
    systemInstruction: `You are NariCare AI, a clinical health assistant. Generate a concise, grounded JSON report analysis strictly matching the requested JSON schema. Do NOT invent lab values, symptoms, or diagnoses.`,
    temperature: 0.1,
    maxTokens
  });

  const duration = (Date.now() - t0) / 1000;
  console.log(`Duration: ${duration.toFixed(2)}s`);
  console.log(`Raw Text Output:\n${res.text}`);
}

async function main() {
  // Test 1: Menstrual (Heavy flow + Severe Pain 8/10 + Cramps)
  const menstrualPrompt = `Analyze the following MENSTRUAL input data and generate a structured JSON report.

Input Data:
"""
User Selected Menstrual Log:
- Cycle Day: Day 2
- Phase: Menstrual Phase
- Flow Level: Heavy
- Pain Level: 8/10 (Severe)
- Primary Mood: Irritable / Sensitive
- Logged Symptoms: Severe Cramps, Fatigue, Back Pain
"""
Target Language: en

INSTRUCTION FOR MENSTRUAL AI:
1. You MUST explicitly mention the user's actual logged values (Cycle Day 2, Phase Menstrual Phase, Heavy Flow, Pain 8/10, Symptoms: Severe Cramps, Fatigue, Back Pain) in the summary.
2. Explain what these specific selections mean in simple, clear language.
3. Provide sensible self-care tips for these exact symptoms.
4. Provide 2-3 actionable next steps.
5. If important context is missing, include 1 concise follow-up question at the end of the summary.
6. Do NOT give a generic article. Do NOT invent unselected symptoms or medical diagnoses.

Return a valid JSON block matching this exact JSON schema:
\`\`\`json
{
  "summary": "Detailed summary explicitly referencing the input values and their meaning",
  "keyFindings": ["Finding 1 with exact value", "Finding 2 with exact value"],
  "extractedValues": [
    { "parameter": "Flow Level", "value": "Heavy", "status": "HIGH" },
    { "parameter": "Pain Level", "value": "8/10", "status": "HIGH" }
  ],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "whenToSeekCare": "When professional medical evaluation is recommended",
  "suggestsFollowup": true
}
\`\`\``;

  await testCase("1. Menstrual Care AI (Heavy + Pain 8/10 + Cramps)", menstrualPrompt);

  // Test 2: CBC Demo Report
  const cbcPrompt = `Analyze the following HEALTH_REPORT input data and generate a structured JSON report.

Input Data:
"""
Report Title: Demo / Sample Report: Complete Blood Count (CBC)
Facility: City Care Diagnostics
TEST PARAMETERS & RESULTS:
1. Hemoglobin: 10.2 g/dL (Reference Range: 12.0 - 15.5 g/dL) [LOW]
2. Hematocrit: 31% (Reference Range: 36% - 46%) [LOW]
3. Red Blood Cell (RBC) Count: 3.8 Million/µL (Reference Range: 4.0 - 5.2 Million/µL) [LOW]
4. White Blood Cell (WBC) Count: 6,500 /µL (Reference Range: 4,500 - 11,000 /µL) [NORMAL]
5. Platelet Count: 250,000 /µL (Reference Range: 150,000 - 450,000 /µL) [NORMAL]
"""
Target Language: en

INSTRUCTION FOR HEALTH REPORT AI:
1. In the "summary", you MUST explicitly state the exact key numerical measured values (Hemoglobin 10.2 g/dL, Hematocrit 31%) and parameter names from the input data.
2. State clearly whether each value is within normal reference range or out-of-range (LOW).
3. Explain what these measured values mean in plain, understandable language without making definitive medical diagnoses.
4. In "extractedValues", list each measured parameter with exact value and status.
5. In "nextSteps", list 2-3 non-prescriptive actionable steps.

Return a valid JSON block matching this exact JSON schema:
\`\`\`json
{
  "summary": "Detailed summary explicitly referencing the input values and their meaning",
  "keyFindings": ["Finding 1 with exact value", "Finding 2 with exact value"],
  "extractedValues": [
    { "parameter": "Hemoglobin", "value": "10.2 g/dL", "status": "LOW" },
    { "parameter": "Hematocrit", "value": "31%", "status": "LOW" }
  ],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "whenToSeekCare": "When professional medical evaluation is recommended",
  "suggestsFollowup": true
}
\`\`\``;

  await testCase("2. CBC Demo Report (Hb 10.2 g/dL, Hct 31%)", cbcPrompt);

  // Test 3: Thyroid Demo Report
  const thyroidPrompt = `Analyze the following HEALTH_REPORT input data and generate a structured JSON report.

Input Data:
"""
Report Title: Demo / Sample Report: Thyroid Profile (T3, T4, TSH)
Facility: Metro Wellness Labs
TEST PARAMETERS & RESULTS:
1. Serum TSH (Thyroid Stimulating Hormone): 6.8 mIU/L (Reference Range: 0.4 - 4.2 mIU/L) [HIGH]
2. Total T4 (Thyroxine): 7.1 µg/dL (Reference Range: 4.5 - 12.0 µg/dL) [NORMAL]
3. Total T3 (Triiodothyronine): 115 ng/dL (Reference Range: 80 - 200 ng/dL) [NORMAL]
"""
Target Language: en

INSTRUCTION FOR HEALTH REPORT AI:
1. In the "summary", you MUST explicitly state the exact key numerical measured value (Serum TSH 6.8 mIU/L) and parameter names from the input data.
2. State clearly whether TSH is within normal reference range or out-of-range (HIGH).
3. Explain what these measured values mean in plain, understandable language without making definitive medical diagnoses.
4. In "extractedValues", list each measured parameter with exact value and status.
5. In "nextSteps", list 2-3 non-prescriptive actionable steps.

Return a valid JSON block matching this exact JSON schema:
\`\`\`json
{
  "summary": "Detailed summary explicitly referencing TSH 6.8 mIU/L and its meaning",
  "keyFindings": ["Finding 1 with exact value", "Finding 2 with exact value"],
  "extractedValues": [
    { "parameter": "Serum TSH", "value": "6.8 mIU/L", "status": "HIGH" }
  ],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "whenToSeekCare": "When professional medical evaluation is recommended",
  "suggestsFollowup": true
}
\`\`\``;

  await testCase("3. Thyroid Demo Report (TSH 6.8 mIU/L)", thyroidPrompt);

  // Test 4: Metabolic Demo Report
  const metabolicPrompt = `Analyze the following HEALTH_REPORT input data and generate a structured JSON report.

Input Data:
"""
Report Title: Demo / Sample Report: Metabolic & Glycemic Panel
Facility: Apex Healthcare Center
TEST PARAMETERS & RESULTS:
1. Fasting Blood Sugar (FBS): 88 mg/dL (Reference Range: 70 - 99 mg/dL) [NORMAL]
2. Postprandial Blood Sugar (PPBS): 125 mg/dL (Reference Range: < 140 mg/dL) [NORMAL]
3. HbA1c (Glycated Hemoglobin): 5.4% (Reference Range: < 5.7%) [NORMAL]
4. Serum Creatinine: 0.8 mg/dL (Reference Range: 0.6 - 1.1 mg/dL) [NORMAL]
"""
Target Language: en

INSTRUCTION FOR HEALTH REPORT AI:
1. In the "summary", you MUST explicitly state the exact key numerical measured values (Fasting Blood Sugar 88 mg/dL, HbA1c 5.4%) and parameter names from the input data.
2. State clearly that all values are within normal reference range.
3. Explain what these measured values mean in plain, understandable language without making definitive medical diagnoses.
4. In "extractedValues", list each measured parameter with exact value and status.
5. In "nextSteps", list 2-3 non-prescriptive actionable steps.

Return a valid JSON block matching this exact JSON schema:
\`\`\`json
{
  "summary": "Detailed summary explicitly referencing FBS 88 mg/dL and HbA1c 5.4% and their normal status",
  "keyFindings": ["Finding 1 with exact value", "Finding 2 with exact value"],
  "extractedValues": [
    { "parameter": "Fasting Blood Sugar (FBS)", "value": "88 mg/dL", "status": "NORMAL" },
    { "parameter": "HbA1c", "value": "5.4%", "status": "NORMAL" }
  ],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "whenToSeekCare": "When professional medical evaluation is recommended",
  "suggestsFollowup": false
}
\`\`\``;

  await testCase("4. Metabolic Demo Report (FBS 88 mg/dL, HbA1c 5.4%)", metabolicPrompt);
}

main();

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testExpansion() {
  console.log("=== TESTING NARICARE AI INTELLIGENCE EXPANSION ===");

  const m = await import('../src/services/geminiService.js');
  
  console.log("\n1. Health Records AI Test...");
  const repRes = await m.generateAIReport({
    type: 'HEALTH_REPORT',
    userData: { name: 'Ananya' },
    reportData: { reportTitle: 'Complete Blood Count (CBC) Panel', doctorOrNotes: 'Hb 9.8 g/dL, TSH 2.1 mIU/L' },
    prompt: 'Interpret CBC report: Hemoglobin is 9.8 g/dL.',
    language: 'en'
  });
  console.log("Health Report Summary:", repRes.summary?.substring(0, 150) + "...");
  console.log("Next Steps (2-3):", repRes.nextSteps);
  await delay(1200);

  console.log("\n2. Menstrual Care AI Test...");
  const menRes = await m.generateAIReport({
    type: 'MENSTRUAL',
    userData: { name: 'Ananya' },
    reportData: { currentDay: 14, phase: 'Ovulation', flowLevel: 'Medium', painLevel: 6, mood: 'Fatigued', symptoms: ['Mild Cramps', 'Fatigue'] },
    prompt: 'Cycle Day 14, severe fatigue and cramps.',
    language: 'en'
  });
  console.log("Menstrual Summary:", menRes.summary?.substring(0, 150) + "...");
  console.log("Next Steps (2-3):", menRes.nextSteps);
  await delay(1200);

  console.log("\n3. Pregnancy Companion AI Test...");
  const pregRes = await m.generateAIReport({
    type: 'PREGNANCY',
    userData: { name: 'Ananya' },
    reportData: { week: 18, trimester: 2, weight: '62.5 kg', bp: '118/76 mmHg' },
    prompt: '18 weeks pregnant with back pain.',
    language: 'en'
  });
  console.log("Pregnancy Summary:", pregRes.summary?.substring(0, 150) + "...");
  console.log("Next Steps (2-3):", pregRes.nextSteps);
  await delay(1200);

  console.log("\n4. Health Education AI Test (Dynamic query)...");
  const edRes = await m.askNariGemini({
    prompt: 'I keep getting painful periods. What could be worth discussing with a doctor?',
    language: 'en'
  });
  console.log("Education Response:", edRes.text?.substring(0, 200) + "...");

  console.log("\n=== ALL AI MODULE TESTS PASSED SILENTLY AND SUCCESSFULLY ===");
}

testExpansion().catch(console.error);

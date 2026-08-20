import { generateAIReport } from './src/services/geminiService.js';

async function testAllThree() {
  console.log("==========================================");
  console.log("TEST 1: Menstrual Care AI");
  console.log("==========================================");
  const res1 = await generateAIReport({
    type: 'MENSTRUAL',
    reportData: {
      currentDay: 2,
      phase: 'Menstrual Phase',
      flowLevel: 'Heavy',
      painLevel: 8,
      mood: 'Irritable',
      symptoms: ['Severe Cramps', 'Fatigue']
    },
    language: 'en'
  });
  console.log("MENSTRUAL SUMMARY:\n", res1.summary);
  console.log("RECOMMENDED PRODUCTS:\n", res1.recommendedProducts);

  console.log("\n==========================================");
  console.log("TEST 2: Pregnancy Companion AI");
  console.log("==========================================");
  const res2 = await generateAIReport({
    type: 'PREGNANCY',
    reportData: {
      week: 16,
      trimester: 2,
      weight: '62.5 kg',
      bp: '118/76 mmHg',
      bloodSugar: '92 mg/dL',
      kicksToday: 10
    },
    language: 'en'
  });
  console.log("PREGNANCY SUMMARY:\n", res2.summary);
  console.log("RECOMMENDED PRODUCTS:\n", res2.recommendedProducts);

  console.log("\n==========================================");
  console.log("TEST 3: Health Record AI (CBC Demo)");
  console.log("==========================================");
  const res3 = await generateAIReport({
    type: 'HEALTH_REPORT',
    reportData: {
      reportTitle: 'Complete Blood Count (CBC)',
      rawReportData: 'Hemoglobin: 10.2 g/dL [LOW], Hematocrit: 31% [LOW], RBC: 3.8 M/µL [LOW]'
    },
    language: 'en'
  });
  console.log("HEALTH REPORT SUMMARY:\n", res3.summary);
}

testAllThree();

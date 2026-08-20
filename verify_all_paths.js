import { LocalAIProvider } from './src/services/providers/localAIProvider.js';
import { llmService } from './src/services/llmService.js';
import { geminiService, askNariGemini, generateAIReport } from './src/services/geminiService.js';
import { analyzeMedicalReport } from './src/services/reportExplainerService.js';
import { conversationMemory } from './src/ai/conversationMemory.ts';

async function runVerification() {
  console.log("=== STARTING NARICARE AI ROUTING & LATENCY VERIFICATION ===");
  const results = {};
  const metrics = [];

  const provider = new LocalAIProvider();
  console.log(`Provider Model: ${provider.model}`);
  console.log(`Provider BaseURL: ${provider.baseUrl}`);

  // Test 1: AI Navigator
  console.log("\n[1/6] Testing AI Navigator AI Path...");
  const t1Start = Date.now();
  try {
    const res1 = await askNariGemini({
      prompt: "Find female gynecologists near me",
      language: "en",
      userProfile: { name: "Ananya Sharma", age: 28 },
      pageContext: "ai-navigator"
    });
    const t1End = Date.now();
    const duration = (t1End - t1Start) / 1000;
    console.log(`AI Navigator Response (${duration.toFixed(2)}s):`, res1.text.substring(0, 120) + "...");
    results["AI Navigator"] = res1.error ? "FAIL" : "PASS";
    metrics.push({ feature: "AI Navigator", timeSec: duration, error: res1.error });
  } catch (e) {
    console.error("AI Navigator Error:", e);
    results["AI Navigator"] = "FAIL";
  }

  // Test 2: Floating Voice Assistant
  console.log("\n[2/6] Testing Voice Assistant AI Path...");
  const t2Start = Date.now();
  try {
    const res2 = await askNariGemini({
      prompt: "Summarize my active health reminders",
      language: "en",
      userProfile: { name: "Ananya Sharma", age: 28 },
      pageContext: "global"
    });
    const t2End = Date.now();
    const duration = (t2End - t2Start) / 1000;
    console.log(`Voice Assistant Response (${duration.toFixed(2)}s):`, res2.text.substring(0, 120) + "...");
    results["Voice Assistant"] = res2.error ? "FAIL" : "PASS";
    metrics.push({ feature: "Voice Assistant", timeSec: duration, error: res2.error });
  } catch (e) {
    console.error("Voice Assistant Error:", e);
    results["Voice Assistant"] = "FAIL";
  }

  // Test 3: Health Records AI
  console.log("\n[3/6] Testing Health Records AI Path (CBC Demo Report)...");
  const demoCBC = {
    id: 'rec_demo_101',
    isDemo: true,
    title: 'Demo / Sample Report: Complete Blood Count (CBC)',
    doctor: 'City Care Diagnostics',
    date: 'Aug 01, 2026',
    sampleValues: [
      { parameter: 'Hemoglobin', value: '10.2 g/dL', reference: '12.0 - 15.5 g/dL', status: 'LOW' },
      { parameter: 'Hematocrit', value: '31%', reference: '36% - 46%', status: 'LOW' }
    ],
    rawReportData: `Complete Blood Count (CBC)\nHemoglobin: 10.2 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]\nHematocrit: 31% (Reference: 36% - 46%) [LOW]`
  };
  const t3Start = Date.now();
  try {
    const res3 = await analyzeMedicalReport(demoCBC.title, demoCBC.doctor, 'en', { name: 'Ananya' }, demoCBC);
    const t3End = Date.now();
    const duration = (t3End - t3Start) / 1000;
    console.log(`Health Records AI Summary (${duration.toFixed(2)}s):`, res3.summary);
    console.log(`Key Findings:`, res3.keyFindings);
    console.log(`Extracted Values:`, res3.extractedValues);
    results["Health Records AI"] = (res3.summary && !res3.summary.includes("temporarily unavailable")) ? "PASS" : "FAIL";
    metrics.push({ feature: "Health Records AI", timeSec: duration, error: false });
  } catch (e) {
    console.error("Health Records AI Error:", e);
    results["Health Records AI"] = "FAIL";
  }

  // Test 4: Menstrual AI
  console.log("\n[4/6] Testing Menstrual AI Path...");
  const t4Start = Date.now();
  try {
    const res4 = await generateAIReport({
      type: 'MENSTRUAL',
      userData: { name: "Ananya" },
      reportData: {
        currentDay: 13,
        phase: 'Ovulation / Fertile Window',
        flowLevel: 'Medium',
        painLevel: 4,
        mood: 'Energetic',
        symptoms: ['Mild Cramps', 'Clear Skin']
      },
      prompt: 'Logged Cycle Day 13, Flow: Medium, Pain: 4/10, Symptoms: Mild Cramps',
      language: 'en'
    });
    const t4End = Date.now();
    const duration = (t4End - t4Start) / 1000;
    console.log(`Menstrual AI Summary (${duration.toFixed(2)}s):`, res4.summary);
    console.log(`Next Steps:`, res4.nextSteps);
    results["Menstrual AI"] = (res4.summary && !res4.summary.includes("temporarily unavailable")) ? "PASS" : "FAIL";
    metrics.push({ feature: "Menstrual AI", timeSec: duration, error: res4.error });
  } catch (e) {
    console.error("Menstrual AI Error:", e);
    results["Menstrual AI"] = "FAIL";
  }

  // Test 5: Pregnancy AI
  console.log("\n[5/6] Testing Pregnancy AI Path...");
  const t5Start = Date.now();
  try {
    const res5 = await generateAIReport({
      type: 'PREGNANCY',
      userData: { name: "Ananya" },
      reportData: {
        week: 16,
        trimester: 2,
        weight: '62.5 kg',
        bp: '118/76 mmHg',
        bloodSugar: '92 mg/dL'
      },
      prompt: 'Pregnancy Companion Week 16 Guidance Request',
      language: 'en'
    });
    const t5End = Date.now();
    const duration = (t5End - t5Start) / 1000;
    console.log(`Pregnancy AI Summary (${duration.toFixed(2)}s):`, res5.summary);
    console.log(`Next Steps:`, res5.nextSteps);
    results["Pregnancy AI"] = (res5.summary && !res5.summary.includes("temporarily unavailable")) ? "PASS" : "FAIL";
    metrics.push({ feature: "Pregnancy AI", timeSec: duration, error: res5.error });
  } catch (e) {
    console.error("Pregnancy AI Error:", e);
    results["Pregnancy AI"] = "FAIL";
  }

  // Test 6: Health Education AI
  console.log("\n[6/6] Testing Health Education AI Path...");
  const t6Start = Date.now();
  try {
    const res6 = await askNariGemini({
      prompt: 'What is PCOS and what are common signs?',
      language: 'en',
      userProfile: { name: "Ananya" },
      pageContext: 'education'
    });
    const t6End = Date.now();
    const duration = (t6End - t6Start) / 1000;
    console.log(`Health Education AI Response (${duration.toFixed(2)}s):`, res6.text.substring(0, 120) + "...");
    results["Health Education AI"] = res6.error ? "FAIL" : "PASS";
    metrics.push({ feature: "Health Education AI", timeSec: duration, error: res6.error });
  } catch (e) {
    console.error("Health Education AI Error:", e);
    results["Health Education AI"] = "FAIL";
  }

  // Multi-turn test
  console.log("\n=== TESTING MULTI-TURN CONVERSATION MEMORY ===");
  conversationMemory.clearMemory();
  const turn1 = await askNariGemini({
    prompt: "I've been having irregular periods.",
    language: 'en',
    userProfile: { name: "Ananya" }
  });
  console.log("User: I've been having irregular periods.");
  console.log("AI Turn 1 Response:", turn1.text);

  const turn2 = await askNariGemini({
    prompt: "About 45–50 days.",
    language: 'en',
    userProfile: { name: "Ananya" }
  });
  console.log("\nUser: About 45–50 days.");
  console.log("AI Turn 2 Response:", turn2.text);

  console.log("\n=== FINAL TEST RESULTS ===");
  console.table(results);
  console.log("\n=== METRICS ===");
  console.table(metrics);
}

runVerification();

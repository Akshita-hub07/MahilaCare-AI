import fs from 'fs';

// Load .env into process.env
try {
  const envText = fs.readFileSync('.env', 'utf8');
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim();
      const v = parts.slice(1).join('=').trim();
      if (k) process.env[k] = v;
    }
  });
} catch (e) {}

import { LocalAIProvider } from './src/services/providers/localAIProvider.js';

async function testLiveOllama() {
  console.log("=== TESTING REAL AI REQUEST THROUGH OLLAMA CLOUD PROVIDER ===");
  
  const provider = new LocalAIProvider();
  console.log(`Configured Provider Name: ${provider.name}`);
  console.log(`Configured Model: ${provider.model}`);
  console.log(`Configured BaseURL: ${provider.baseUrl || '(relative proxy /v1)'}`);
  console.log(`API Key Loaded: ${!!provider.apiKey} (${provider.apiKey ? provider.apiKey.substring(0, 8) + '...' : 'EMPTY'})`);

  const start = Date.now();
  const res = await provider.generateCompletion({
    prompt: "Give a brief 1-sentence warm greeting for MahilaCare AI.",
    conversationHistory: [],
    systemInstruction: "You are MahilaCare AI, a warm health assistant.",
    temperature: 0.3,
    maxTokens: 50
  });

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log("\n=== COMPLETED AI INFERENCE RESULT ===");
  console.log(`Duration: ${duration}s`);
  console.log(`Error: ${res.error}`);
  if (res.error) {
    console.log(`Error Message: ${res.errorMessage}`);
    console.log(`Status Code: ${res.status}`);
  } else {
    console.log(`Model Used: ${res.modelUsed}`);
    console.log(`Response Text:\n${res.text}`);
  }
}

testLiveOllama();

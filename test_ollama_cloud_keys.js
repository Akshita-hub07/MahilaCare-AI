import fs from 'fs';

// Read .env
let envText = '';
try {
  envText = fs.readFileSync('.env', 'utf8');
} catch (e) {}

const envLines = envText.split('\n');
const env = {};
envLines.forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const apiKey = env.OLLAMA_API_KEY || env.VITE_OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY || '';

console.log("=== OLLAMA CLOUD DETAILED TEST ===");
console.log("Loaded API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : 'EMPTY');

const modelsToTest = ['qwen2.5:1.5b-instruct', 'qwen2.5', 'qwen2.5:1.5b', 'qwen2.5:7b'];
const endpointsToTest = [
  'https://ollama.com/v1/chat/completions',
  'https://ollama.com/api/chat',
  'https://api.ollama.com/api/chat'
];

async function runTest() {
  for (const ep of endpointsToTest) {
    for (const model of modelsToTest) {
      console.log(`\nTesting: endpoint=${ep} model=${model}`);
      
      const isV1 = ep.includes('/v1/');
      const body = isV1 ? {
        model,
        messages: [{ role: 'user', content: 'Say hello in 3 words.' }],
        max_tokens: 20
      } : {
        model,
        messages: [{ role: 'user', content: 'Say hello in 3 words.' }],
        stream: false
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['X-Api-Key'] = apiKey;
      }

      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
        console.log(`Status: ${res.status} ${res.statusText}`);
        const resText = await res.text();
        console.log(`Response: ${resText.substring(0, 200)}`);
        if (res.ok) {
          console.log("SUCCESS!");
          return;
        }
      } catch (err) {
        console.log(`Error: ${err.message}`);
      }
    }
  }
}

runTest();

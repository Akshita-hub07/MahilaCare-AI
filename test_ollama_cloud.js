import fs from 'fs';
import path from 'path';

// Read .env
let envText = '';
try {
  envText = fs.readFileSync('.env', 'utf8');
} catch (e) {}

console.log("=== OLLAMA CLOUD DIAGNOSTIC ===");
console.log(".env contents:\n", envText);

const envLines = envText.split('\n');
const env = {};
envLines.forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const apiKey = env.OLLAMA_API_KEY || env.VITE_OLLAMA_CLOUD_API_KEY || process.env.OLLAMA_API_KEY || '';
const cloudUrl = env.OLLAMA_CLOUD_URL || env.VITE_OLLAMA_CLOUD_URL || 'https://api.ollama.com';
const model = env.VITE_OLLAMA_MODEL || 'qwen2.5:1.5b-instruct';

console.log(`API Key present: ${!!apiKey} (${apiKey ? apiKey.substring(0, 8) + '...' : 'EMPTY'})`);
console.log(`Cloud URL: ${cloudUrl}`);
console.log(`Model: ${model}`);

const endpointsToTest = [
  { url: 'https://api.ollama.com/v1/chat/completions', type: 'openai' },
  { url: 'https://ollama.com/v1/chat/completions', type: 'openai' },
  { url: 'https://api.ollama.com/api/chat', type: 'ollama_native' },
  { url: 'https://ollama.com/api/chat', type: 'ollama_native' }
];

async function testEndpoints() {
  for (const ep of endpointsToTest) {
    console.log(`\nTesting Endpoint: ${ep.url}`);
    
    let body;
    if (ep.type === 'openai') {
      body = {
        model: model,
        messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
        max_tokens: 50
      };
    } else {
      body = {
        model: model,
        messages: [{ role: 'user', content: 'Say hello in 5 words.' }],
        stream: false
      };
    }

    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    try {
      const res = await fetch(ep.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      console.log(`HTTP Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Response Body: ${text.substring(0, 300)}`);
    } catch (e) {
      console.log(`Fetch Error: ${e.message}`);
    }
  }
}

testEndpoints();

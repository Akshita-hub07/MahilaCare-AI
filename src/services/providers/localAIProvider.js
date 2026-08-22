/**
 * NariCare AI - Ollama Cloud AI Provider
 *
 * Connects NariCare AI to Ollama Cloud API endpoint:
 * https://ollama.com/v1/chat/completions or https://ollama.com/api/chat
 *
 * Environment Variables (configurable):
 * - OLLAMA_CLOUD_URL / VITE_OLLAMA_CLOUD_URL (default: https://ollama.com)
 * - OLLAMA_API_KEY / VITE_OLLAMA_CLOUD_API_KEY (stored in env/backend configuration)
 * - VITE_OLLAMA_MODEL (default: qwen2.5:1.5b-instruct)
 */

import { BaseLLMProvider } from './llmProvider.js';
import { stripCodeAndJsonFences } from '../../utils/textCleaner.js';

export class LocalAIProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super();
    const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    const defaultUrl = 'https://ollama.com';

    this.baseUrl = (
      config.baseUrl !== undefined
        ? config.baseUrl
        : (metaEnv.VITE_OLLAMA_CLOUD_URL || metaEnv.OLLAMA_CLOUD_URL || defaultUrl)
    ).replace(/\/+$/, '');

    this.model =
      config.model ||
      metaEnv.VITE_OLLAMA_MODEL ||
      metaEnv.VITE_LOCAL_AI_MODEL ||
      'qwen2.5:1.5b-instruct';

    const processEnv = typeof process !== 'undefined' && process.env ? process.env : {};
    this.apiKey = config.apiKey || metaEnv.VITE_OLLAMA_CLOUD_API_KEY || metaEnv.OLLAMA_API_KEY || processEnv.OLLAMA_API_KEY || processEnv.VITE_OLLAMA_CLOUD_API_KEY || '';

    this.name = "NariCare AI Engine";
  }

  /**
   * Main completion function sending requests to Ollama Cloud inference server
   */
  async generateCompletion({
    prompt,
    conversationHistory = [],
    systemInstruction = '',
    temperature = 0.3,
    maxTokens = 800
  }) {
    if (!prompt || !prompt.trim()) {
      return {
        error: true,
        errorMessage: 'Please enter a health question or statement.'
      };
    }

    const messages = [];

    // 1. Append system instructions
    if (systemInstruction && systemInstruction.trim()) {
      messages.push({
        role: 'system',
        content: systemInstruction.trim()
      });
    }

    // 2. Append recent multi-turn conversation history (up to 6 turns)
    const recentHistory = conversationHistory.slice(-6);
    for (const msg of recentHistory) {
      const text = msg.text || msg.content || '';
      if (!text.trim()) continue;
      messages.push({
        role: msg.sender === 'user' || msg.role === 'user' ? 'user' : 'assistant',
        content: text.trim()
      });
    }

    // 3. Append current user query
    messages.push({
      role: 'user',
      content: prompt.trim()
    });

    const isBrowser = typeof window !== 'undefined';
    const origin = isBrowser && window.location?.origin ? window.location.origin : '';
    const primaryEndpoint = origin ? `${origin}/api/chat` : '/api/chat';
    const requestId = `req_cloud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[NariCare AI Engine] START requestId=${requestId} model=${this.model} endpoint=${primaryEndpoint}`);

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['X-Api-Key'] = this.apiKey;
    }

    const requestBodyOpenAI = {
      model: this.model,
      messages,
      temperature: temperature || 0.3,
      max_tokens: maxTokens || 800
    };

    let response;
    let usedEndpoint = primaryEndpoint;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      // Attempt 1: Call Vercel Serverless Endpoint (/api/chat)
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBodyOpenAI),
          signal: controller.signal
        });
      } catch (primaryErr) {
        console.warn('[NariCare AI Engine] Serverless /api/chat fetch failed, trying direct endpoint...', primaryErr);
      }

      clearTimeout(timeoutId);

      // Attempt 2: Direct Ollama Cloud Endpoint Fallback
      if (!response || !response.ok) {
        const cloudFallbackEndpoint = `${this.baseUrl}/v1/chat/completions`;
        console.warn(`[NariCare AI Engine] Serverless /api/chat status=${response?.status || 'network_error'}, trying direct Ollama Cloud endpoint: ${cloudFallbackEndpoint}`);
        usedEndpoint = cloudFallbackEndpoint;

        try {
          const fallbackController = new AbortController();
          const fallbackTimeout = setTimeout(() => fallbackController.abort(), 5000);
          response = await fetch(cloudFallbackEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBodyOpenAI),
            signal: fallbackController.signal
          });
          clearTimeout(fallbackTimeout);
        } catch (fallbackErr) {
          console.warn('[NariCare AI Engine] Direct Cloud endpoint fetch error:', fallbackErr.message);
        }
      }

      // Attempt 3: Native Ollama Cloud Endpoint (/api/chat on cloud host)
      if (!response || !response.ok) {
        const nativeEndpoint = `${this.baseUrl}/api/chat`;
        usedEndpoint = nativeEndpoint;

        const requestBodyNative = {
          model: this.model,
          messages,
          stream: false,
          options: { temperature: temperature || 0.3, num_predict: maxTokens || 800 }
        };

        try {
          const nativeController = new AbortController();
          const nativeTimeout = setTimeout(() => nativeController.abort(), 5000);
          response = await fetch(nativeEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBodyNative),
            signal: nativeController.signal
          });
          clearTimeout(nativeTimeout);
        } catch (nativeErr) {
          console.warn('[NariCare AI Engine] Native Cloud endpoint fetch error:', nativeErr.message);
        }
      }

      // Attempt 4: Local Dev Engine Fallback (http://localhost:11434/api/chat)
      if (!response || response.status === 401 || response.status === 403 || !response.ok) {
        const cloudStatus = response?.status;
        const errorText = response ? await response.text().catch(() => '') : '';
        console.error(`[NariCare AI Engine DIAGNOSTIC] Serverless/Cloud Status: ${cloudStatus || 'FAILED'} | Endpoint: ${usedEndpoint} | Details: ${errorText || 'No response'}`);

        // Try local Ollama server if running on port 11434
        const localFallbackEndpoint = 'http://localhost:11434/api/chat';
        try {
          console.log(`[NariCare AI Engine] Attempting local Qwen fallback engine at ${localFallbackEndpoint}...`);
          const localRes = await fetch(localFallbackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: this.model,
              messages,
              stream: false,
              options: { temperature: temperature || 0.3, num_predict: maxTokens || 800 }
            })
          });

          if (localRes.ok) {
            response = localRes;
            usedEndpoint = localFallbackEndpoint;
          }
        } catch (localErr) {
          console.warn('[NariCare AI Engine] Local fallback engine not available:', localErr.message);
        }
      }

      if (!response || !response.ok) {
        const finalErrorText = response ? await response.text().catch(() => '') : 'No response';
        console.error(`[NariCare AI Engine FINAL ERROR] HTTP error status=${response?.status} endpoint=${usedEndpoint} body=${finalErrorText}`);
        return {
          error: true,
          errorMessage: 'NariCare AI is temporarily unavailable. Please try again shortly.',
          status: response?.status
        };
      }

      const data = await response.json();
      console.log(`[NariCare AI Engine] END requestId=${requestId} status=200 endpoint=${usedEndpoint}`);

      const rawText = data?.choices?.[0]?.message?.content?.trim() || data?.message?.content?.trim() || (typeof data?.response === 'string' ? data.response.trim() : (typeof data?.text === 'string' ? data.text.trim() : null));

      if (!rawText) {
        console.error(`[NariCare AI Engine] Received empty response content.`);
        return {
          error: true,
          errorMessage: 'NariCare AI is temporarily unavailable. Please try again shortly.',
          status: 200
        };
      }

      const { text, action } = this.parseActionFromResponse(rawText);

      return {
        error: false,
        text,
        action,
        rawText,
        modelUsed: "NariCare AI Engine" // Clean user-facing branding
      };

    } catch (error) {
      if (error?.name === 'AbortError') {
        console.error('[NariCare AI Engine] Request timeout.');
        return {
          error: true,
          errorMessage: 'NariCare AI is temporarily unavailable. Please try again shortly.'
        };
      }

      console.error('[NariCare AI Engine Exception]:', error);
      return {
        error: true,
        errorMessage: 'NariCare AI is temporarily unavailable. Please try again shortly.'
      };
    }
  }

  /**
   * Helper to parse structured JSON action blocks (e.g. navigation intent) embedded in model response
   */
  parseActionFromResponse(rawText) {
    let action = null;

    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i) || rawText.match(/(\{[\s\S]*"action"[\s\S]*\})/i) || rawText.match(/(\{[\s\S]*"intent"[\s\S]*\})/i);

    if (jsonMatch && (jsonMatch[1] || jsonMatch[0])) {
      const jsonStr = (jsonMatch[1] || jsonMatch[0]).trim();
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && (parsed.intent === 'NAVIGATION' || parsed.destination || (typeof parsed.action === 'string' && (parsed.action.startsWith('OPEN_') || parsed.action.startsWith('SWITCH_'))))) {
          action = parsed;
        }
      } catch (err) {
        console.warn('NariCare AI Engine: Failed to parse action JSON:', err);
      }
    }

    let cleanText = stripCodeAndJsonFences(rawText);

    if (!cleanText && action) {
      cleanText = `Navigating to ${action.destination || action.action || 'requested section'}...`;
    }

    return { text: cleanText || 'I am here to help with your healthcare questions.', action };
  }
}

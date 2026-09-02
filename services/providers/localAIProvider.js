/**
 * MahilaCare AI - Ollama Cloud AI Provider
 *
 * Connects MahilaCare AI to Ollama Cloud API endpoint:
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

    this.name = "MahilaCare AI Engine";
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
    const primaryEndpoint = `${this.baseUrl}/v1/chat/completions`;
    const proxyEndpoint = '/v1/chat/completions';
    const requestId = `req_cloud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[MahilaCare AI Engine] START requestId=${requestId} model=${this.model} endpoint=${primaryEndpoint}`);

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
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Attempt 1: Primary Cloud OpenAI Endpoint
      try {
        response = await fetch(primaryEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBodyOpenAI),
          signal: controller.signal
        });
      } catch (primaryErr) {
        if (isBrowser) {
          console.warn('[MahilaCare AI Engine] Primary Cloud endpoint fetch failed, trying proxy /v1/chat/completions...', primaryErr);
          usedEndpoint = proxyEndpoint;
          response = await fetch(proxyEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBodyOpenAI),
            signal: controller.signal
          }).catch(() => null);
        }
      }

      clearTimeout(timeoutId);

      // Attempt 2: Native Ollama Cloud Endpoint (/api/chat)
      if (!response || !response.ok) {
        const nativeEndpoint = `${this.baseUrl}/api/chat`;
        console.warn(`[MahilaCare AI Engine] Cloud OpenAI endpoint status=${response?.status || 'network_error'}, trying native Ollama Cloud endpoint: ${nativeEndpoint}`);
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
          console.warn('[MahilaCare AI Engine] Native Cloud endpoint fetch error:', nativeErr.message);
        }
      }

      // Attempt 3: Local Dev Engine Fallback (http://localhost:11434) if Cloud Key is placeholder/unauthorized in dev
      if (!response || response.status === 401 || response.status === 403 || !response.ok) {
        const cloudStatus = response?.status;
        const errorText = response ? await response.text().catch(() => '') : '';
        console.error(`[MahilaCare AI Engine DIAGNOSTIC] Ollama Cloud Status: ${cloudStatus || 'FAILED'} | Endpoint: ${usedEndpoint} | Details: ${errorText || 'No response'}`);

        // Try local Ollama server if running on port 11434
        const localFallbackEndpoint = 'http://localhost:11434/api/chat';
        try {
          console.log(`[MahilaCare AI Engine] Attempting local Qwen fallback engine at ${localFallbackEndpoint}...`);
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
          console.warn('[MahilaCare AI Engine] Local fallback engine not available:', localErr.message);
        }
      }

      if (!response || !response.ok) {
        const finalErrorText = response ? await response.text().catch(() => '') : 'No response';
        console.error(`[MahilaCare AI Engine FINAL ERROR] HTTP error status=${response?.status} endpoint=${usedEndpoint} body=${finalErrorText}`);
        return {
          error: true,
          errorMessage: 'MahilaCare AI is temporarily unavailable. Please try again shortly.',
          status: response?.status
        };
      }

      const data = await response.json();
      console.log(`[MahilaCare AI Engine] END requestId=${requestId} status=200 endpoint=${usedEndpoint}`);

      const rawText = data?.choices?.[0]?.message?.content?.trim() || data?.message?.content?.trim() || (typeof data?.response === 'string' ? data.response.trim() : null);

      if (!rawText) {
        console.error(`[MahilaCare AI Engine] Received empty response content.`);
        return {
          error: true,
          errorMessage: 'MahilaCare AI is temporarily unavailable. Please try again shortly.',
          status: 200
        };
      }

      const { text, action } = this.parseActionFromResponse(rawText);

      return {
        error: false,
        text,
        action,
        rawText,
        modelUsed: "MahilaCare AI Engine" // Clean user-facing branding
      };

    } catch (error) {
      if (error?.name === 'AbortError') {
        console.error('[MahilaCare AI Engine] Request timeout.');
        return {
          error: true,
          errorMessage: 'MahilaCare AI is temporarily unavailable. Please try again shortly.'
        };
      }

      console.error('[MahilaCare AI Engine Exception]:', error);
      return {
        error: true,
        errorMessage: 'MahilaCare AI is temporarily unavailable. Please try again shortly.'
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
        console.warn('MahilaCare AI Engine: Failed to parse action JSON:', err);
      }
    }

    let cleanText = stripCodeAndJsonFences(rawText);

    if (!cleanText && action) {
      cleanText = `Navigating to ${action.destination || action.action || 'requested section'}...`;
    }

    return { text: cleanText || 'I am here to help with your healthcare questions.', action };
  }
}

/**
 * Concrete Gemini LLM Provider
 * Connects NariCare AI to Google Gemini REST API v1beta.
 */

import { BaseLLMProvider } from './llmProvider.js';
import { stripCodeAndJsonFences } from '../../utils/textCleaner.js';

export class GeminiProvider extends BaseLLMProvider {
  constructor(config = {}) {
    super();
    const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

    this.apiKey =
      config.apiKey ||
      metaEnv.VITE_GEMINI_API_KEY ||
      metaEnv.VITE_GOOGLE_API_KEY ||
      '';

    this.primaryModel =
      config.model ||
      metaEnv.VITE_GEMINI_MODEL ||
      'gemini-2.5-flash';

    this.fallbackModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  /**
   * Main generateCompletion implementation
   */
  async generateCompletion({
    prompt,
    conversationHistory = [],
    systemInstruction = '',
    temperature = 0.4,
    maxTokens = 2500
  }) {
    if (!this.apiKey) {
      console.error('NariCare Provider: API key is missing.');
      return {
        error: true,
        errorMessage: 'NariCare AI API key configuration is missing.'
      };
    }

    if (!prompt || !prompt.trim()) {
      return {
        error: true,
        errorMessage: 'Please enter a health question or statement.'
      };
    }

    // Try primary model first, fallback only if 404 is returned
    const modelsToTry = [this.primaryModel, ...this.fallbackModels.filter(m => m !== this.primaryModel)];

    let lastErrorResult = null;

    for (const modelName of modelsToTry) {
      const result = await this.executeRequest({
        modelName,
        prompt,
        conversationHistory,
        systemInstruction,
        temperature,
        maxTokens
      });

      if (!result.error) {
        return result;
      }

      // On 429 (Rate Limit), STOP retrying models immediately to prevent duplicate calls & quota burn
      if (result.status === 429) {
        return {
          error: true,
          status: 429,
          errorMessage: 'NariCare AI is temporarily busy. Please try again shortly.'
        };
      }

      // If error is 404 (model deprecated), try next fallback model
      if (result.status === 404) {
        console.warn(`Model "${modelName}" returned 404. Trying fallback model...`);
        lastErrorResult = result;
        continue;
      }

      // For non-404 errors (e.g. 401, 403, 500), return the error directly
      return result;
    }

    return lastErrorResult || {
      error: true,
      errorMessage: 'NariCare AI is temporarily busy. Please try again shortly.'
    };
  }

  /**
   * Internal HTTP execution logic
   */
  async executeRequest({
    modelName,
    prompt,
    conversationHistory,
    systemInstruction,
    temperature,
    maxTokens
  }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`AI_REQUEST_START requestId=${requestId} model=${modelName} timestamp=${new Date().toISOString()}`);

    try {
      const endpoint = `${this.baseUrl}/${modelName}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      // Format multi-turn history into Gemini's contents array schema
      const contents = [];

      // Include recent conversation turn pairs (up to 4 turns to keep context payload compact)
      const recentHistory = conversationHistory.slice(-4);

      for (const msg of recentHistory) {
        const text = msg.text || msg.content || '';
        if (!text.trim()) continue;

        contents.push({
          role: msg.sender === 'user' || msg.role === 'user' ? 'user' : 'model',
          parts: [{ text }]
        });
      }

      // Append current user message
      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const requestBody = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      if (systemInstruction) {
        requestBody.system_instruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let quotaDetails = {};

        try {
          const parsedErr = JSON.parse(errorText);
          const violation = parsedErr?.error?.details?.find(d => d.violations)?.violations?.[0];
          const retryInfo = parsedErr?.error?.details?.find(d => d.retryDelay || d['@type']?.includes('RetryInfo'));

          quotaDetails = {
            quotaMetric: violation?.quotaMetric || 'Unknown Metric',
            quotaId: violation?.quotaId || 'Unknown QuotaId',
            quotaValue: violation?.quotaValue || 'Unknown QuotaValue',
            retryDelay: retryInfo?.retryDelay || 'Unknown RetryDelay',
            statusReason: parsedErr?.error?.status || 'ERROR'
          };
        } catch (e) {
          // Fallback if raw text is non-JSON
        }

        console.error(`AI_REQUEST_END requestId=${requestId} status=${response.status} timestamp=${new Date().toISOString()}`);
        console.error(`[NariCare AI Dev Diagnostic] Status: ${response.status}`, quotaDetails);

        let friendlyMessage = `NariCare AI is temporarily busy. Please try again shortly.`;

        if (response.status === 429) {
          friendlyMessage = `NariCare AI is temporarily busy. Please try again shortly.`;
        } else if (response.status === 401 || response.status === 403) {
          friendlyMessage = `NariCare AI Service Authorization Error (${response.status}).`;
        }

        return {
          error: true,
          errorMessage: friendlyMessage,
          status: response.status,
          rawError: errorText,
          quotaDetails
        };
      }

      const data = await response.json();
      console.log(`AI_REQUEST_END requestId=${requestId} status=200 timestamp=${new Date().toISOString()}`);

      const rawText = data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || '')
        .join('')
        .trim();

      if (!rawText) {
        return {
          error: true,
          errorMessage: 'NariCare AI Service: Received empty response payload.',
          status: 200
        };
      }

      const { text, action } = this.parseActionFromResponse(rawText);

      return {
        error: false,
        text,
        action,
        rawText,
        modelUsed: modelName
      };

    } catch (error) {
      if (error?.name === 'AbortError') {
        return {
          error: true,
          errorMessage: 'NariCare AI Service: Request timed out (20s limit). Please check your connection.'
        };
      }

      console.error('NariCare Provider Exception:', error);
      return {
        error: true,
        errorMessage: 'NariCare AI Connection Error. Please try again shortly.'
      };
    }
  }

  /**
   * Safe parser for structured JSON action blocks embedded in responses
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
        console.warn('NariCare Provider: Failed to parse action JSON:', err);
      }
    }

    let cleanText = stripCodeAndJsonFences(rawText);

    if (!cleanText && action) {
      cleanText = `Navigating to ${action.destination || action.action || 'requested section'}...`;
    }

    return { text: cleanText || 'I am here to help with your healthcare questions.', action };
  }
}

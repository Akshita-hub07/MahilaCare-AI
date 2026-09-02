/**
 * Base LLM Provider Abstraction
 * Allows MahilaCare AI to switch between Gemini, OpenAI, Anthropic, or local API proxies
 * without rewriting the Health Navigator or core application logic.
 */

export class BaseLLMProvider {
  /**
   * @param {Object} options
   * @param {string} options.prompt - Current user question/input
   * @param {Array} options.conversationHistory - Recent multi-turn messages
   * @param {string} options.systemInstruction - MahilaCare system prompt
   * @param {number} [options.temperature=0.4] - Sampling temperature
   * @param {number} [options.maxTokens=1000] - Max response tokens
   * @returns {Promise<{error: boolean, text?: string, action?: any, errorMessage?: string, status?: number}>}
   */
  async generateCompletion(options) {
    throw new Error('generateCompletion() must be implemented by concrete LLM provider subclass.');
  }
}

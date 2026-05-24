import axios from 'axios';
import OpenAI from 'openai';
import { ConfigService } from './configService.js';
import type { AppConfig } from '../../shared/types.js';

export class LLMService {
  static async generateResponse(
    question: string,
    context: string
  ): Promise<string> {
    const config = await ConfigService.getConfig();
    
    const prompt = this.buildPrompt(question, context);

    try {
      if (config.llmProvider === 'openai' && config.openaiApiKey) {
        return await this.callOpenAI(config, prompt);
      } else if (config.llmProvider === 'ollama') {
        return await this.callOllama(config, prompt);
      } else {
        return this.generateMockResponse(question, context);
      }
    } catch (error) {
      console.error('LLM API error:', error);
      return this.generateMockResponse(question, context);
    }
  }

  private static buildPrompt(question: string, context: string): string {
    return `你是一个有用的AI助手，请基于以下提供的上下文内容来回答用户的问题。

上下文内容：
${context}

用户问题：${question}

请根据上下文内容回答问题。如果上下文中没有相关信息，请诚实地说"根据提供的文档，我无法找到相关信息来回答您的问题。"。请用中文回答。`;
  }

  private static async callOpenAI(config: AppConfig, prompt: string): Promise<string> {
    const openai = new OpenAI({
      apiKey: config.openaiApiKey
    });

    const response = await openai.chat.completions.create({
      model: config.openaiModel || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || '抱歉，我无法生成回答。';
  }

  private static async callOllama(config: AppConfig, prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${config.ollamaBaseUrl}/api/generate`,
        {
          model: config.ollamaModel || 'llama2',
          prompt: prompt,
          stream: false
        },
        { timeout: 60000 }
      );

      return response.data.response || '抱歉，我无法生成回答。';
    } catch (error) {
      console.error('Ollama API error:', error);
      return this.generateMockResponse(prompt, '');
    }
  }

  private static generateMockResponse(question: string, context: string): string {
    if (context.length > 0) {
      return `这是一个模拟回答。针对您的问题"${question}"，在提供的文档中找到了相关内容。\n\n找到的相关内容片段：\n${context.substring(0, 500)}...\n\n（注意：这是模拟响应，您需要配置Ollama或OpenAI来获得真实的AI回答）`;
    }
    return `根据提供的文档，我无法找到相关信息来回答您的问题"${question}"。\n\n（注意：这是模拟响应，您需要配置Ollama或OpenAI来获得真实的AI回答）`;
  }
}

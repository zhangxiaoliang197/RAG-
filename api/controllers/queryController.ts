import { Request, Response } from 'express';
import { VectorService } from '../services/vectorService.js';
import { LLMService } from '../services/llmService.js';

export class QueryController {
  static async query(req: Request, res: Response): Promise<void> {
    try {
      const { question, topK = 5 } = req.body;

      if (!question) {
        res.status(400).json({ success: false, error: 'Question is required' });
        return;
      }

      const sources = await VectorService.search(question, topK);
      
      let context = '';
      sources.forEach((source, index) => {
        context += `[${index + 1}] 来源: ${source.documentName}\n内容: ${source.content}\n\n`;
      });

      const answer = await LLMService.generateResponse(question, context);

      res.json({
        success: true,
        answer,
        sources
      });
    } catch (error) {
      console.error('Query error:', error);
      res.status(500).json({ success: false, error: 'Failed to process query' });
    }
  }
}

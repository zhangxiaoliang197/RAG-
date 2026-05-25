import { Request, Response } from 'express';
import { generateSql, generateExplanation } from '../services/text2sqlService.js';
import { executeSql, validateSql, loadOracleConfig } from '../services/oracleService.js';
import { ConfigService } from '../services/configService.js';
import type { AnalyzeRequest, ExecuteSqlRequest } from '../../shared/types.js';

export class AnalysisController {
  static async analyzeQuery(req: Request, res: Response): Promise<void> {
    try {
      const { question, topK = 3 } = req.body as AnalyzeRequest;

      const [appConfig, oracleConfig] = await Promise.all([
        ConfigService.getConfig(),
        loadOracleConfig()
      ]);

      const llmConfig = {
        provider: appConfig.llmProvider,
        baseUrl: appConfig.ollamaBaseUrl,
        apiKey: appConfig.openaiApiKey,
        model: appConfig.llmProvider === 'ollama' ? appConfig.ollamaModel : appConfig.openaiModel
      };

      const { sql, retrievedMetrics, retrievedExamples } = await generateSql(question, llmConfig, topK);

      let sqlValid = false;
      let sqlError: string | undefined;
      let result: any[] | undefined;
      let resultColumns: string[] | undefined;
      let explanation: string = '';

      if (oracleConfig) {
        const validation = await validateSql(sql);
        sqlValid = validation.valid;
        sqlError = validation.error;

        if (sqlValid) {
          const execResult = await executeSql(sql);
          result = execResult.rows;
          resultColumns = execResult.columns;
          
          explanation = await generateExplanation(question, sql, result, llmConfig);
        }
      } else {
        explanation = '请先配置 Oracle 数据库连接';
      }

      res.json({
        success: true,
        question,
        sql,
        sqlValid,
        sqlError,
        result,
        resultColumns,
        explanation,
        retrievedMetrics,
        retrievedExamples
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async generateOnlySql(req: Request, res: Response): Promise<void> {
    try {
      const { question, topK = 3 } = req.body as AnalyzeRequest;

      const appConfig = await ConfigService.getConfig();
      const llmConfig = {
        provider: appConfig.llmProvider,
        baseUrl: appConfig.ollamaBaseUrl,
        apiKey: appConfig.openaiApiKey,
        model: appConfig.llmProvider === 'ollama' ? appConfig.ollamaModel : appConfig.openaiModel
      };

      const { sql, retrievedMetrics, retrievedExamples } = await generateSql(question, llmConfig, topK);

      res.json({
        success: true,
        sql,
        retrievedMetrics,
        retrievedExamples
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async executeOnlySql(req: Request, res: Response): Promise<void> {
    try {
      const { sql } = req.body as ExecuteSqlRequest;

      const validation = await validateSql(sql);
      if (!validation.valid) {
        res.json({
          success: true,
          sqlValid: false,
          sqlError: validation.error
        });
        return;
      }

      const startTime = Date.now();
      const execResult = await executeSql(sql);
      const executionTime = Date.now() - startTime;

      res.json({
        success: true,
        sqlValid: true,
        result: execResult.rows,
        resultColumns: execResult.columns,
        executionTime
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

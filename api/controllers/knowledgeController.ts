import { Request, Response } from 'express';
import {
  saveMetricKnowledge,
  loadAllMetricKnowledge,
  deleteMetricKnowledge,
  saveSqlExample,
  loadAllSqlExamples,
  deleteSqlExample
} from '../services/knowledgeService.js';
import { v4 as uuidv4 } from 'uuid';
import type { MetricKnowledge, SqlExample, CreateMetricKnowledgeRequest, CreateSqlExampleRequest } from '../../shared/types.js';

export class KnowledgeController {
  static async saveMetric(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateMetricKnowledgeRequest;
      const now = new Date().toISOString();
      const metric: MetricKnowledge = {
        id: uuidv4(),
        ...data,
        tags: data.tags || [],
        createdAt: now,
        updatedAt: now
      };
      await saveMetricKnowledge(metric);
      res.json({ success: true, metric });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateMetric(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as Partial<MetricKnowledge>;
      const allMetrics = await loadAllMetricKnowledge();
      const existing = allMetrics.find(m => m.id === id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Metric not found' });
        return;
      }
      const updated: MetricKnowledge = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      };
      await saveMetricKnowledge(updated);
      res.json({ success: true, metric: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await loadAllMetricKnowledge();
      res.json({ success: true, metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteMetric(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await deleteMetricKnowledge(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async saveSqlExample(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateSqlExampleRequest;
      const now = new Date().toISOString();
      const example: SqlExample = {
        id: uuidv4(),
        ...data,
        description: data.description || '',
        createdAt: now,
        updatedAt: now
      };
      await saveSqlExample(example);
      res.json({ success: true, example });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateSqlExample(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as Partial<SqlExample>;
      const allExamples = await loadAllSqlExamples();
      const existing = allExamples.find(e => e.id === id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Example not found' });
        return;
      }
      const updated: SqlExample = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      };
      await saveSqlExample(updated);
      res.json({ success: true, example: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllSqlExamples(req: Request, res: Response): Promise<void> {
    try {
      const examples = await loadAllSqlExamples();
      res.json({ success: true, examples });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteSqlExample(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await deleteSqlExample(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

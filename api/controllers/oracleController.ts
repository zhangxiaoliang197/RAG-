import { Request, Response } from 'express';
import {
  initOraclePool,
  testConnection,
  getTables,
  getTableStructure,
  executeSql,
  validateSql,
  saveOracleConfig,
  loadOracleConfig,
  saveTableMetadata,
  loadAllTableMetadata,
  deleteTableMetadata
} from '../services/oracleService.js';
import { v4 as uuidv4 } from 'uuid';
import type { OracleConfig, CreateTableMetadataRequest, TableMetadata } from '../../shared/types.js';

export class OracleController {
  static async testOracleConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as OracleConfig;
      const result = await testConnection(config);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async saveOracleConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as OracleConfig;
      await saveOracleConfig(config);
      await initOraclePool(config);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOracleConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await loadOracleConfig();
      const safeConfig = config ? { ...config, password: '***' } : null;
      res.json({ success: true, config: safeConfig });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOracleTables(req: Request, res: Response): Promise<void> {
    try {
      const schema = req.query.schema as string | undefined;
      const tables = await getTables(schema);
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOracleTableStructure(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      const schema = req.query.schema as string | undefined;
      const columns = await getTableStructure(tableName, schema);
      res.json({ success: true, columns });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async saveTable(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateTableMetadataRequest;
      const now = new Date().toISOString();
      const metadata: TableMetadata = {
        id: uuidv4(),
        ...data,
        schema: data.schema || '',
        createdAt: now,
        updatedAt: now
      };
      await saveTableMetadata(metadata);
      res.json({ success: true, metadata });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateTable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as Partial<TableMetadata>;
      const allTables = await loadAllTableMetadata();
      const existing = allTables.find(t => t.id === id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Table not found' });
        return;
      }
      const updated: TableMetadata = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString()
      };
      await saveTableMetadata(updated);
      res.json({ success: true, metadata: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllTables(req: Request, res: Response): Promise<void> {
    try {
      const tables = await loadAllTableMetadata();
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteTable(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await deleteTableMetadata(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async executeSql(req: Request, res: Response): Promise<void> {
    try {
      const { sql } = req.body;
      const startTime = Date.now();
      const result = await executeSql(sql);
      const executionTime = Date.now() - startTime;
      res.json({ success: true, ...result, executionTime });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async validateSql(req: Request, res: Response): Promise<void> {
    try {
      const { sql } = req.body;
      const result = await validateSql(sql);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

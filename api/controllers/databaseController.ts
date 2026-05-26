import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateTableMetadataRequest,
  DatabaseConfig,
  TableMetadata
} from '../../shared/types.js';
import {
  executeSql,
  getActiveDatabaseConfig,
  getRemoteTableStructure,
  getRemoteTables,
  setActiveDatabaseConfig,
  testDatabaseConnection,
  validateSql
} from '../services/databaseService.js';
import { deleteTableMetadata, loadAllTableMetadata, saveTableMetadata } from '../services/tableMetadataService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DRIVER_DIR = path.join(DATA_DIR, 'db-drivers');

function sanitizeConfig(config: DatabaseConfig | null): any {
  if (!config) return null;
  if (config.type === 'oracle') {
    return { ...config, password: '***' };
  }
  const driverJarName = config.driverJarPath ? path.basename(config.driverJarPath) : undefined;
  return { ...config, password: '***', driverJarPath: driverJarName };
}

export class DatabaseController {
  static async testConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as DatabaseConfig;
      const result = await testDatabaseConnection(config);
      res.json({ success: true, valid: result.success, error: result.error });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async saveConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = req.body as DatabaseConfig;
      await setActiveDatabaseConfig(config);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await getActiveDatabaseConfig();
      res.json({ success: true, config: sanitizeConfig(config) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async uploadDriver(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        res.status(400).json({ success: false, error: 'Missing file' });
        return;
      }

      if (!fs.existsSync(DRIVER_DIR)) {
        fs.mkdirSync(DRIVER_DIR, { recursive: true });
      }

      const id = uuidv4();
      const ext = path.extname(file.originalname) || '.jar';
      const targetPath = path.join(DRIVER_DIR, `${id}${ext}`);
      fs.writeFileSync(targetPath, file.buffer);

      res.json({ success: true, driverJarPath: targetPath, fileName: file.originalname });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRemoteTables(req: Request, res: Response): Promise<void> {
    try {
      const schema = req.query.schema as string | undefined;
      const tables = await getRemoteTables(schema);
      res.json({ success: true, tables });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getRemoteTableStructure(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      const schema = req.query.schema as string | undefined;
      const columns = await getRemoteTableStructure(tableName, schema);
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


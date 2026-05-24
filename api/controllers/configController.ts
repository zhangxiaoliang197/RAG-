import { Request, Response } from 'express';
import { ConfigService } from '../services/configService.js';
import type { AppConfig } from '../../shared/types.js';

export class ConfigController {
  static async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await ConfigService.getConfig();
      const safeConfig = { ...config };
      delete (safeConfig as any).openaiApiKey;
      res.json({ success: true, config: safeConfig });
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({ success: false, error: 'Failed to get config' });
    }
  }

  static async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const newConfig = req.body as Partial<AppConfig>;
      const currentConfig = await ConfigService.getConfig();
      const updatedConfig = { ...currentConfig, ...newConfig };
      
      await ConfigService.saveConfig(updatedConfig);
      
      const safeConfig = { ...updatedConfig };
      delete (safeConfig as any).openaiApiKey;
      
      res.json({ success: true, config: safeConfig });
    } catch (error) {
      console.error('Update config error:', error);
      res.status(500).json({ success: false, error: 'Failed to update config' });
    }
  }
}

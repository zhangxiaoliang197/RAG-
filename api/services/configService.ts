import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig } from '../../shared/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.resolve(__dirname, '../../data/config.json');

const DEFAULT_CONFIG: AppConfig = {
  llmProvider: 'ollama',
  ollamaModel: 'llama2',
  ollamaBaseUrl: 'http://localhost:11434',
  openaiApiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  chunkSize: 512,
  chunkOverlap: 50
};

export class ConfigService {
  private static config: AppConfig | null = null;

  static async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      } else {
        this.config = { ...DEFAULT_CONFIG };
        await this.saveConfig(this.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = { ...DEFAULT_CONFIG };
    }

    return this.config;
  }

  static async saveConfig(config: AppConfig): Promise<void> {
    this.config = config;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  }

  static async getConfig(): Promise<AppConfig> {
    return await this.loadConfig();
  }
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TableMetadata } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

const TABLE_METADATA_PATH = path.join(DATA_DIR, 'table-metadata.json');

export async function saveTableMetadata(metadata: TableMetadata): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let allMetadata: TableMetadata[] = [];
  if (fs.existsSync(TABLE_METADATA_PATH)) {
    allMetadata = JSON.parse(fs.readFileSync(TABLE_METADATA_PATH, 'utf-8'));
  }

  const existingIndex = allMetadata.findIndex(
    t => t.id === metadata.id || (t.tableName === metadata.tableName && t.schema === metadata.schema)
  );
  if (existingIndex >= 0) {
    allMetadata[existingIndex] = metadata;
  } else {
    allMetadata.push(metadata);
  }

  fs.writeFileSync(TABLE_METADATA_PATH, JSON.stringify(allMetadata, null, 2));
}

export async function loadAllTableMetadata(): Promise<TableMetadata[]> {
  if (fs.existsSync(TABLE_METADATA_PATH)) {
    return JSON.parse(fs.readFileSync(TABLE_METADATA_PATH, 'utf-8'));
  }
  return [];
}

export async function deleteTableMetadata(id: string): Promise<void> {
  if (fs.existsSync(TABLE_METADATA_PATH)) {
    const allMetadata = JSON.parse(fs.readFileSync(TABLE_METADATA_PATH, 'utf-8'));
    const filtered = allMetadata.filter((t: TableMetadata) => t.id !== id);
    fs.writeFileSync(TABLE_METADATA_PATH, JSON.stringify(filtered, null, 2));
  }
}

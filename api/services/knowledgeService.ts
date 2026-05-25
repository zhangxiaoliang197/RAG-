import { MetricKnowledge, SqlExample } from '../../shared/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

const METRIC_KNOWLEDGE_PATH = path.join(DATA_DIR, 'metric-knowledge.json');
const SQL_EXAMPLES_PATH = path.join(DATA_DIR, 'sql-examples.json');

export async function saveMetricKnowledge(knowledge: MetricKnowledge): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let allKnowledge: MetricKnowledge[] = [];
  if (fs.existsSync(METRIC_KNOWLEDGE_PATH)) {
    allKnowledge = JSON.parse(fs.readFileSync(METRIC_KNOWLEDGE_PATH, 'utf-8'));
  }

  const existingIndex = allKnowledge.findIndex(m => m.id === knowledge.id);
  if (existingIndex >= 0) {
    allKnowledge[existingIndex] = knowledge;
  } else {
    allKnowledge.push(knowledge);
  }

  fs.writeFileSync(METRIC_KNOWLEDGE_PATH, JSON.stringify(allKnowledge, null, 2));
}

export async function loadAllMetricKnowledge(): Promise<MetricKnowledge[]> {
  if (fs.existsSync(METRIC_KNOWLEDGE_PATH)) {
    return JSON.parse(fs.readFileSync(METRIC_KNOWLEDGE_PATH, 'utf-8'));
  }
  return [];
}

export async function deleteMetricKnowledge(id: string): Promise<void> {
  if (fs.existsSync(METRIC_KNOWLEDGE_PATH)) {
    const allKnowledge = JSON.parse(fs.readFileSync(METRIC_KNOWLEDGE_PATH, 'utf-8'));
    const filtered = allKnowledge.filter((m: MetricKnowledge) => m.id !== id);
    fs.writeFileSync(METRIC_KNOWLEDGE_PATH, JSON.stringify(filtered, null, 2));
  }
}

export async function saveSqlExample(example: SqlExample): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let allExamples: SqlExample[] = [];
  if (fs.existsSync(SQL_EXAMPLES_PATH)) {
    allExamples = JSON.parse(fs.readFileSync(SQL_EXAMPLES_PATH, 'utf-8'));
  }

  const existingIndex = allExamples.findIndex(e => e.id === example.id);
  if (existingIndex >= 0) {
    allExamples[existingIndex] = example;
  } else {
    allExamples.push(example);
  }

  fs.writeFileSync(SQL_EXAMPLES_PATH, JSON.stringify(allExamples, null, 2));
}

export async function loadAllSqlExamples(): Promise<SqlExample[]> {
  if (fs.existsSync(SQL_EXAMPLES_PATH)) {
    return JSON.parse(fs.readFileSync(SQL_EXAMPLES_PATH, 'utf-8'));
  }
  return [];
}

export async function deleteSqlExample(id: string): Promise<void> {
  if (fs.existsSync(SQL_EXAMPLES_PATH)) {
    const allExamples = JSON.parse(fs.readFileSync(SQL_EXAMPLES_PATH, 'utf-8'));
    const filtered = allExamples.filter((e: SqlExample) => e.id !== id);
    fs.writeFileSync(SQL_EXAMPLES_PATH, JSON.stringify(filtered, null, 2));
  }
}

import { 
  TableMetadata, 
  MetricKnowledge, 
  SqlExample, 
  AnalyzeResponse 
} from '../../shared/types';
import axios from 'axios';
import { loadAllTableMetadata } from './tableMetadataService.js';
import { loadAllMetricKnowledge, loadAllSqlExamples } from './knowledgeService.js';

interface LLMConfig {
  provider: 'ollama' | 'openai';
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}

function formatTableStructures(tables: TableMetadata[]): string {
  return tables.map(table => {
    const columns = table.columns.map(col => {
      let colInfo = `- ${col.columnName} (${col.dataType})`;
      if (col.primaryKey) colInfo += ' [PK]';
      if (col.comment !== col.columnName) colInfo += ` - ${col.comment}`;
      return colInfo;
    }).join('\n');

    const relationships = table.relationships.length > 0 
      ? `\n关系:\n` + table.relationships.map(r => 
          `- ${r.fromColumn} -> ${r.toTable}.${r.toColumn} (${r.type})`
        ).join('\n')
      : '';

    return `表名: ${table.tableName} (${table.displayName})
描述: ${table.tableComment}
字段:
${columns}${relationships}`;
  }).join('\n\n');
}

function formatMetricKnowledge(metrics: MetricKnowledge[]): string {
  if (metrics.length === 0) return '';
  return metrics.map(m => `
指标: ${m.name}
分类: ${m.category}
定义: ${m.definition}
计算公式: ${m.formula}
关联表: ${m.relatedTables.join(', ')}
`).join('\n');
}

function formatSqlExamples(examples: SqlExample[]): string {
  if (examples.length === 0) return '';
  return examples.map(e => `
示例 ${e.complexity}:
问题: ${e.naturalLanguage}
SQL: ${e.sql}
关联指标: ${e.metrics.join(', ')}
`).join('\n');
}

function buildPrompt(
  question: string, 
  tables: TableMetadata[], 
  metrics: MetricKnowledge[], 
  examples: SqlExample[]
): string {
  return `你是一位专业的数据分析专家，擅长根据用户的问题生成 Oracle 兼容语法的 SQL 查询（适用于 Oracle/达梦 等）。

## 可用的数据表结构:
${formatTableStructures(tables)}

## 相关指标知识:
${formatMetricKnowledge(metrics)}

## 参考的 SQL 示例:
${formatSqlExamples(examples)}

## 用户问题:
${question}

请按以下要求生成 SQL:
1. 使用 Oracle 兼容的 SQL 语法
2. 仅返回 SQL 语句，不要包含任何解释或注释
3. 确保表和字段名称与上面列出的完全一致
4. 合理处理日期类型，使用 TRUNC, TO_CHAR, ADD_MONTHS 等函数
5. 使用表别名提高可读性
6. 如果需要分页，使用 ROWNUM 或 FETCH FIRST
7. 只返回一个 SQL 语句

SQL:`;
}

function buildExplanationPrompt(question: string, sql: string, result: any): string {
  return `用户问题: ${question}

生成的 SQL:
${sql}

查询结果:
${JSON.stringify(result, null, 2)}

请用简洁的语言解释查询结果的含义，并说明数据是如何计算的。`;
}

function simpleSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, '');
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, '');
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = [...words1].filter(x => words2.has(x)).length;
  const union = new Set([...words1, ...words2]).size;
  return union > 0 ? intersection / union : 0;
}

function retrieveRelevantMetrics(question: string, allMetrics: MetricKnowledge[], topK: number = 3): MetricKnowledge[] {
  return [...allMetrics]
    .map(m => ({
      metric: m,
      score: Math.max(
        simpleSimilarity(question, m.name),
        simpleSimilarity(question, m.definition),
        simpleSimilarity(question, m.category)
      )
    }))
    .sort((a, b) => b.score - a.score)
    .filter(x => x.score > 0)
    .slice(0, topK)
    .map(x => x.metric);
}

function retrieveRelevantExamples(question: string, allExamples: SqlExample[], topK: number = 3): SqlExample[] {
  return [...allExamples]
    .map(e => ({
      example: e,
      score: simpleSimilarity(question, e.naturalLanguage)
    }))
    .sort((a, b) => b.score - a.score)
    .filter(x => x.score > 0)
    .slice(0, topK)
    .map(x => x.example);
}

export async function generateSql(
  question: string,
  llmConfig: LLMConfig,
  topK: number = 3
): Promise<{
  sql: string;
  retrievedMetrics: MetricKnowledge[];
  retrievedExamples: SqlExample[];
  allTables: TableMetadata[];
}> {
  const [allTables, allMetrics, allExamples] = await Promise.all([
    loadAllTableMetadata(),
    loadAllMetricKnowledge(),
    loadAllSqlExamples()
  ]);

  const retrievedMetrics = retrieveRelevantMetrics(question, allMetrics, topK);
  const retrievedExamples = retrieveRelevantExamples(question, allExamples, topK);

  const prompt = buildPrompt(question, allTables, retrievedMetrics, retrievedExamples);

  let sql = '';
  
  if (llmConfig.provider === 'ollama' && llmConfig.baseUrl) {
    const response = await axios.post(`${llmConfig.baseUrl}/api/generate`, {
      model: llmConfig.model || 'llama3.1',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 1000
      }
    });
    sql = response.data.response.trim();
  } else if (llmConfig.provider === 'openai' && llmConfig.apiKey) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: llmConfig.model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1000
    }, {
      headers: { 'Authorization': `Bearer ${llmConfig.apiKey}` }
    });
    sql = response.data.choices[0].message.content.trim();
  }

  sql = sql.replace(/```sql|```/g, '').trim();
  
  return {
    sql,
    retrievedMetrics,
    retrievedExamples,
    allTables
  };
}

export async function generateExplanation(
  question: string,
  sql: string,
  result: any,
  llmConfig: LLMConfig
): Promise<string> {
  const prompt = buildExplanationPrompt(question, sql, result);

  if (llmConfig.provider === 'ollama' && llmConfig.baseUrl) {
    const response = await axios.post(`${llmConfig.baseUrl}/api/generate`, {
      model: llmConfig.model || 'llama3.1',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 500
      }
    });
    return response.data.response.trim();
  } else if (llmConfig.provider === 'openai' && llmConfig.apiKey) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: llmConfig.model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    }, {
      headers: { 'Authorization': `Bearer ${llmConfig.apiKey}` }
    });
    return response.data.choices[0].message.content.trim();
  }
  
  return '已执行查询，请查看结果数据。';
}

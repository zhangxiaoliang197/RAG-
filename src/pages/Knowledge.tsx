import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Brain, Code } from 'lucide-react';
import { api } from '../services/api';
import type { MetricKnowledge, SqlExample, CreateMetricKnowledgeRequest, CreateSqlExampleRequest } from '../../shared/types';

export function Knowledge() {
  const [metrics, setMetrics] = useState<MetricKnowledge[]>([]);
  const [examples, setExamples] = useState<SqlExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'metrics' | 'examples'>('metrics');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricKnowledge | null>(null);
  const [editingExample, setEditingExample] = useState<SqlExample | null>(null);
  const [metricForm, setMetricForm] = useState<CreateMetricKnowledgeRequest>({
    name: '',
    definition: '',
    formula: '',
    category: '',
    relatedTables: [],
  });
  const [exampleForm, setExampleForm] = useState<CreateSqlExampleRequest>({
    naturalLanguage: '',
    sql: '',
    tablesUsed: [],
    metrics: [],
    complexity: 'simple',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [metricsRes, examplesRes] = await Promise.all([
        api.knowledge.getAllMetrics(),
        api.knowledge.getAllSqlExamples(),
      ]);
      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (examplesRes.success) setExamples(examplesRes.examples);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveMetric() {
    try {
      if (editingMetric) {
        await api.knowledge.updateMetric(editingMetric.id, metricForm);
      } else {
        await api.knowledge.saveMetric(metricForm);
      }
      setShowMetricModal(false);
      setEditingMetric(null);
      resetMetricForm();
      await loadData();
    } catch (error) {
      alert('保存指标失败');
    }
  }

  async function deleteMetric(id: string) {
    if (!confirm('确定要删除这个指标吗？')) return;
    try {
      await api.knowledge.deleteMetric(id);
      await loadData();
    } catch (error) {
      alert('删除指标失败');
    }
  }

  function editMetric(metric: MetricKnowledge) {
    setEditingMetric(metric);
    setMetricForm({
      name: metric.name,
      definition: metric.definition,
      formula: metric.formula,
      category: metric.category,
      relatedTables: metric.relatedTables,
      tags: metric.tags,
    });
    setShowMetricModal(true);
  }

  function resetMetricForm() {
    setMetricForm({
      name: '',
      definition: '',
      formula: '',
      category: '',
      relatedTables: [],
    });
    setEditingMetric(null);
  }

  async function saveExample() {
    try {
      if (editingExample) {
        await api.knowledge.updateSqlExample(editingExample.id, exampleForm);
      } else {
        await api.knowledge.saveSqlExample(exampleForm);
      }
      setShowExampleModal(false);
      setEditingExample(null);
      resetExampleForm();
      await loadData();
    } catch (error) {
      alert('保存示例失败');
    }
  }

  async function deleteExample(id: string) {
    if (!confirm('确定要删除这个示例吗？')) return;
    try {
      await api.knowledge.deleteSqlExample(id);
      await loadData();
    } catch (error) {
      alert('删除示例失败');
    }
  }

  function editExample(example: SqlExample) {
    setEditingExample(example);
    setExampleForm({
      naturalLanguage: example.naturalLanguage,
      sql: example.sql,
      tablesUsed: example.tablesUsed,
      metrics: example.metrics,
      complexity: example.complexity,
      description: example.description,
    });
    setShowExampleModal(true);
  }

  function resetExampleForm() {
    setExampleForm({
      naturalLanguage: '',
      sql: '',
      tablesUsed: [],
      metrics: [],
      complexity: 'simple',
      description: '',
    });
    setEditingExample(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">知识库管理</h1>
        <button
          onClick={() => {
            if (activeTab === 'metrics') {
              resetMetricForm();
              setShowMetricModal(true);
            } else {
              resetExampleForm();
              setShowExampleModal(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90"
        >
          <Plus size={16} />
          添加{activeTab === 'metrics' ? '指标' : '示例'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain size={18} />
            指标知识
          </div>
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'examples'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Code size={18} />
            SQL 示例
          </div>
        </button>
      </div>

      {activeTab === 'metrics' ? (
        <div className="grid gap-4">
          {metrics.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500">
              <Brain size={48} className="mx-auto mb-4 text-slate-300" />
              <p>还没有添加任何指标知识</p>
            </div>
          ) : (
            metrics.map(metric => (
              <div key={metric.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{metric.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {metric.category}
                      </span>
                      {metric.tags?.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-600 mb-3">{metric.definition}</p>
                    <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-700">
                      {metric.formula}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      相关表: {metric.relatedTables.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => editMetric(metric)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteMetric(metric.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {examples.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-slate-500">
              <Code size={48} className="mx-auto mb-4 text-slate-300" />
              <p>还没有添加任何 SQL 示例</p>
            </div>
          ) : (
            examples.map(example => (
              <div key={example.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        example.complexity === 'simple' ? 'bg-green-100 text-green-700' :
                        example.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {example.complexity === 'simple' ? '简单' :
                         example.complexity === 'medium' ? '中等' : '复杂'}
                      </span>
                      {example.tablesUsed.map(table => (
                        <span key={table} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {table}
                        </span>
                      ))}
                      {example.metrics.map(metric => (
                        <span key={metric} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          {metric}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-700 mb-3">{example.naturalLanguage}</p>
                    {example.description && (
                      <p className="text-sm text-slate-500 mb-3">{example.description}</p>
                    )}
                    <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                      {example.sql}
                    </pre>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => editExample(example)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteExample(example.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showMetricModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingMetric ? '编辑指标' : '添加指标'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">指标名称</label>
                <input
                  type="text"
                  value={metricForm.name}
                  onChange={(e) => setMetricForm({ ...metricForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">分类</label>
                <input
                  type="text"
                  value={metricForm.category}
                  onChange={(e) => setMetricForm({ ...metricForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标签（逗号分隔）</label>
                <input
                  type="text"
                  value={metricForm.tags?.join(',') || ''}
                  onChange={(e) => setMetricForm({ ...metricForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">相关表（逗号分隔）</label>
                <input
                  type="text"
                  value={metricForm.relatedTables.join(',')}
                  onChange={(e) => setMetricForm({ ...metricForm, relatedTables: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">指标定义</label>
                <textarea
                  value={metricForm.definition}
                  onChange={(e) => setMetricForm({ ...metricForm, definition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">计算公式</label>
                <textarea
                  value={metricForm.formula}
                  onChange={(e) => setMetricForm({ ...metricForm, formula: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setShowMetricModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={saveMetric}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showExampleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingExample ? '编辑示例' : '添加示例'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">自然语言描述</label>
                <textarea
                  value={exampleForm.naturalLanguage}
                  onChange={(e) => setExampleForm({ ...exampleForm, naturalLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">复杂度</label>
                  <select
                    value={exampleForm.complexity}
                    onChange={(e) => setExampleForm({ ...exampleForm, complexity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="simple">简单</option>
                    <option value="medium">中等</option>
                    <option value="complex">复杂</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">相关指标（逗号分隔）</label>
                  <input
                    type="text"
                    value={exampleForm.metrics.join(',')}
                    onChange={(e) => setExampleForm({ ...exampleForm, metrics: e.target.value.split(',').map(m => m.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">使用的表（逗号分隔）</label>
                <input
                  type="text"
                  value={exampleForm.tablesUsed.join(',')}
                  onChange={(e) => setExampleForm({ ...exampleForm, tablesUsed: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SQL 语句</label>
                <textarea
                  value={exampleForm.sql}
                  onChange={(e) => setExampleForm({ ...exampleForm, sql: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  rows={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">描述（可选）</label>
                <textarea
                  value={exampleForm.description}
                  onChange={(e) => setExampleForm({ ...exampleForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setShowExampleModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={saveExample}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

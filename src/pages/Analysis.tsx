import { useState } from 'react';
import { Play, Copy, CheckCircle, XCircle, Sparkles, Database, Brain, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import type { AnalyzeResponse } from '../../shared/types';

export function Analysis() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [editingSql, setEditingSql] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    
    try {
      setLoading(true);
      const response = await api.analysis.analyze({ question });
      if (response.success) {
        setResult(response);
        setEditingSql(response.sql);
      }
    } catch (error) {
      alert('分析失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSql = async () => {
    if (!editingSql.trim()) return;
    
    try {
      setExecuting(true);
      const response = await api.analysis.executeSql(editingSql);
      if (response.success) {
        setExecutionResult(response);
      }
    } catch (error) {
      alert('执行失败');
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(editingSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">智能指标分析</h1>
        <p className="text-slate-500">描述你的问题，AI 会帮您生成 SQL 并查询结果</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="请描述您想查询的指标，例如：计算华东区 Q1 销售额..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !question.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Sparkles size={20} />
                  智能分析
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Database size={20} />
                  生成的 SQL
                </h2>
                <div className="flex items-center gap-2">
                  {result.sqlValid ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle size={16} />
                      语法正确
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 text-sm">
                      <XCircle size={16} />
                      {result.sqlError}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <textarea
                value={editingSql}
                onChange={(e) => setEditingSql(e.target.value)}
                className="w-full font-mono text-sm bg-slate-900 text-slate-100 rounded-lg p-4 min-h-[200px] resize-y"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={copySql}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? '已复制' : '复制 SQL'}
                </button>
                <button
                  onClick={handleExecuteSql}
                  disabled={executing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {executing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Play size={16} />
                  )}
                  执行 SQL
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Brain size={20} />
                分析说明
              </h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap">{result.explanation}</p>
            </div>
          </div>

          {result.retrievedMetrics.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Brain size={20} />
                  相关指标
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {result.retrievedMetrics.map((metric, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4">
                      <div className="font-medium text-slate-800 mb-1">{metric.name}</div>
                      <div className="text-sm text-slate-600 mb-2">{metric.definition}</div>
                      <div className="text-sm text-slate-500 font-mono">{metric.formula}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {result.retrievedExamples.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} />
                  参考示例
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-3">
                  {result.retrievedExamples.map((example, i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-700 mb-2">{example.naturalLanguage}</div>
                      <div className="text-xs text-slate-500 font-mono bg-slate-800 text-slate-200 p-3 rounded">
                        {example.sql}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(result.result || executionResult?.result) && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} />
                  查询结果
                </h2>
              </div>
              <div className="p-6">
                {executionResult?.executionTime && (
                  <div className="text-sm text-slate-500 mb-4">
                    执行时间: {executionResult.executionTime}ms
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        {(result.resultColumns || executionResult?.resultColumns)?.map((col, i) => (
                          <th key={i} className="px-4 py-2 text-left text-sm font-medium text-slate-700 border-b border-slate-200">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(result.result || executionResult?.result)?.slice(0, 100).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {((result.result?.length || 0) > 100 || (executionResult?.result?.length || 0) > 100) && (
                  <div className="text-sm text-slate-500 text-center mt-4">
                    显示前 100 条结果
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';
import type { AppConfig } from '../../shared/types.js';

export function Settings() {
  const [config, setConfig] = useState<Partial<AppConfig>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const { config: storeConfig, setConfig: setStoreConfig } = useAppStore();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.config.get();
      if (response.success) {
        setConfig(response.config);
        setStoreConfig(response.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    
    try {
      const response = await api.config.update(config);
      if (response.success) {
        setStoreConfig(response.config);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">设置</h2>
        <p className="text-slate-500 mt-1">
          配置您的 AI 模型和向量数据库参数
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            AI 模型配置
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                模型提供商
              </label>
              <select
                value={config.llmProvider || 'ollama'}
                onChange={(e) => setConfig({ ...config, llmProvider: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ollama">Ollama (本地)</option>
                <option value="openai">OpenAI API</option>
              </select>
            </div>

            {config.llmProvider === 'ollama' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ollama 基础 URL
                  </label>
                  <input
                    type="text"
                    value={config.ollamaBaseUrl || 'http://localhost:11434'}
                    onChange={(e) => setConfig({ ...config, ollamaBaseUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="http://localhost:11434"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={config.ollamaModel || 'llama2'}
                    onChange={(e) => setConfig({ ...config, ollamaModel: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="llama2"
                  />
                </div>
              </>
            )}

            {config.llmProvider === 'openai' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={config.openaiApiKey || ''}
                    onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sk-..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={config.openaiModel || 'gpt-3.5-turbo'}
                    onChange={(e) => setConfig({ ...config, openaiModel: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="gpt-3.5-turbo"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            向量数据库配置
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                文本块大小 (字符)
              </label>
              <input
                type="number"
                value={config.chunkSize || 512}
                onChange={(e) => setConfig({ ...config, chunkSize: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="128"
                max="4096"
              />
              <p className="text-xs text-slate-500 mt-2">
                每个文本块的最大字符数，较大的值可以保留更多上下文
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                文本块重叠 (字符)
              </label>
              <input
                type="number"
                value={config.chunkOverlap || 50}
                onChange={(e) => setConfig({ ...config, chunkOverlap: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="512"
              />
              <p className="text-xs text-slate-500 mt-2">
                相邻文本块之间的重叠字符数，用于保持上下文连续性
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <span className="font-medium">已保存</span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={20} />
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}

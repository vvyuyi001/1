import { useState, useEffect, useCallback } from 'react';
import { Save, Key, Globe, Thermometer, Search, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getSettings, updateSettings } from '../lib/api';

export function SettingsPage() {
  const { setSettings } = useStore();
  const [formData, setFormData] = useState({
    openaiApiKey: '',
    openaiBaseUrl: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    temperature: 0.7,
    topK: 5,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      setFormData((prev) => ({ ...prev, ...savedSettings }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [setSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleProviderChange = (provider: string) => {
    if (provider === 'deepseek') {
      setFormData((prev) => ({
        ...prev,
        openaiBaseUrl: 'https://api.deepseek.com',
        model: 'deepseek-chat',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        openaiBaseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
      }));
    }
  };

  const getModelOptions = () => {
    if (formData.openaiBaseUrl.includes('deepseek')) {
      return (
        <>
          <option value="deepseek-chat">deepseek-chat (通用对话)</option>
          <option value="deepseek-coder">deepseek-coder (代码助手)</option>
        </>
      );
    }
    return (
      <>
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
        <option value="gpt-4">gpt-4</option>
        <option value="gpt-4-turbo-preview">gpt-4-turbo-preview</option>
      </>
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSettings({
        openaiBaseUrl: formData.openaiBaseUrl,
        model: formData.model,
        temperature: formData.temperature,
        topK: formData.topK,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full bg-dark p-6 overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">系统设置</h2>
          <p className="text-slate-400">
            配置 LLM API 和问答参数
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-light border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-white">LLM 提供商</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleProviderChange('deepseek')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.openaiBaseUrl.includes('deepseek')
                    ? 'border-secondary bg-secondary/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-semibold text-white">DeepSeek</div>
                <div className="text-xs text-slate-400 mt-1">性价比高 · 强大推理</div>
              </button>

              <button
                onClick={() => handleProviderChange('openai')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.openaiBaseUrl.includes('openai')
                    ? 'border-secondary bg-secondary/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">✨</div>
                <div className="font-semibold text-white">OpenAI</div>
                <div className="text-xs text-slate-400 mt-1">GPT-4 · 行业标杆</div>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </div>
                </label>
                <input
                  type="password"
                  value={formData.openaiApiKey}
                  onChange={(e) => setFormData((prev) => ({ ...prev, openaiApiKey: e.target.value }))}
                  placeholder="sk-..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  您的 API Key 仅保存在服务器内存中，不会持久化存储
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    API Base URL
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.openaiBaseUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, openaiBaseUrl: e.target.value }))}
                  placeholder="https://api.deepseek.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  模型名称
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                >
                  {getModelOptions()}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-dark-light border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-white">问答参数</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300">
                    温度 (Temperature)
                  </label>
                  <span className="text-secondary font-mono">{formData.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <p className="text-xs text-slate-500 mt-2">
                  较低的值使回答更确定，较高的值使回答更有创造性
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    检索结果数量 (Top K)
                  </label>
                  <span className="text-secondary font-mono">{formData.topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.topK}
                  onChange={(e) => setFormData((prev) => ({ ...prev, topK: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <p className="text-xs text-slate-500 mt-2">
                  从知识库中检索的相关文档片段数量
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {showSuccess && (
              <span className="text-green-400 flex items-center gap-2">
                ✓ 设置已保存
              </span>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSaving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

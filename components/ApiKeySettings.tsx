"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 假设已有supabase客户端配置

type ApiKeys = {
  openai: string;
  deepseek: string;
  pinecone: string;
  serper: string;
  supabase_url: string;
  supabase_anon: string;
};

const ApiKeySettings = () => {
  const [keys, setKeys] = useState<ApiKeys>({
    openai: '',
    deepseek: '',
    pinecone: '',
    serper: '',
    supabase_url: '',
    supabase_anon: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchKeys = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('api_keys')
        .eq('user_id', user?.id)
        .single();

      if (!error && data?.api_keys) {
        setKeys(data.api_keys);
      }
      setIsLoading(false);
    };

    fetchKeys();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user?.id,
        api_keys: keys
      })
      .eq('user_id', user?.id);

    setIsSaving(false);
    if (!error) {
      alert('设置保存成功！');
    } else {
      alert('保存失败，请重试');
    }
  };

  const handleInputChange = (key: keyof ApiKeys) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys(prev => ({ ...prev, [key]: e.target.value }));
  };

  if (isLoading) return <div>加载中...</div>;

  return (
    <div className="rounded-xl border bg-white shadow">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="font-semibold">API密钥管理</div>
        <div className="text-sm text-gray-500">安全存储您的第三方服务凭证</div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label>OpenAI API Key</label>
            <input
              type="password"
              value={keys.openai}
              onChange={handleInputChange('openai')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <label>DeepSeek API Key</label>
            <input
              type="password"
              value={keys.deepseek}
              onChange={handleInputChange('deepseek')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="sk-..."
            />
          </div>

          <div className="space-y-2">
            <label>Pinecone API Key</label>
            <input
              type="password"
              value={keys.pinecone}
              onChange={handleInputChange('pinecone')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="pcsk_..."
            />
          </div>

          <div className="space-y-2">
            <label>Serper API Key</label>
            <input
              type="password"
              value={keys.serper}
              onChange={handleInputChange('serper')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="serper api key"
            />
          </div>

          <div className="space-y-2">
            <label>Supabase URL</label>
            <input
              type="url"
              value={keys.supabase_url}
              onChange={handleInputChange('supabase_url')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label>Supabase Anon Key</label>
            <input
              type="password"
              value={keys.supabase_anon}
              onChange={handleInputChange('supabase_anon')}
              className="border px-4 py-2 rounded-md w-full"
              placeholder="eyJhbGciOi..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSaving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
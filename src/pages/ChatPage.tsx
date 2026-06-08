import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { sendChat } from '../lib/api';
import { Message as MessageType } from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';

export function ChatPage() {
  const { messages, addMessage, clearMessages, isLoading, setIsLoading } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: MessageType = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChat({
        question: input,
        history: messages,
      });

      const assistantMessage: MessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">欢迎使用知识库助手</h2>
            <p className="text-slate-400 max-w-md">
              请先在知识库中上传文档，然后就可以开始提问了！
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-dark-light">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="输入您的问题..."
              className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isLoading ? '发送中...' : '发送'}
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="bg-slate-700 text-slate-400 px-4 py-3 rounded-xl hover:bg-slate-600 hover:text-white transition-all"
                title="清空对话"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Message({ message }: { message: MessageType }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(false);

  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    const html = marked.parse(message.content);
    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: typeof html === 'string' ? html : '' }}
      />
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-3xl ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div
          className={`flex items-start gap-3 ${
            isUser ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isUser
                ? 'bg-gradient-to-br from-secondary to-primary'
                : 'bg-slate-700'
            }`}
          >
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          <div
            className={`rounded-2xl px-5 py-4 ${
              isUser
                ? 'bg-gradient-to-r from-primary to-secondary text-white'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            {renderContent()}
          </div>
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 ml-13">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-secondary hover:text-white flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {showSources ? '隐藏' : '显示'}引用来源 ({message.sources.length})
            </button>

            {showSources && (
              <div className="mt-2 ml-13 space-y-2">
                {message.sources.map((source, index) => (
                  <div
                    key={index}
                    className="bg-dark-light border border-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-secondary" />
                      <span className="text-xs font-medium text-secondary">
                        {source.documentName}
                      </span>
                      <span className="text-xs text-slate-500">
                        (相似度: {(source.score * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { MessageSquare, BookOpen, Settings, Brain } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Sidebar() {
  const { currentPage, setCurrentPage } = useStore();

  const navItems = [
    { id: 'chat', label: '智能问答', icon: MessageSquare },
    { id: 'knowledge', label: '知识库', icon: BookOpen },
    { id: 'settings', label: '设置', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-dark-light border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">知识库助手</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          基于 RAG 的智能问答系统
        </div>
      </div>
    </aside>
  );
}

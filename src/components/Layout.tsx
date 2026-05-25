import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, FileText, Settings, Database, Brain, BarChart3 } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '智能问答', icon: MessageSquare },
    { path: '/analysis', label: '指标分析', icon: BarChart3 },
    { path: '/tables', label: '数据表管理', icon: Database },
    { path: '/knowledge', label: '知识库', icon: Brain },
    { path: '/documents', label: '文档管理', icon: FileText },
    { path: '/settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex h-screen">
        <nav className="w-64 bg-white shadow-xl border-r border-slate-200 flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              指标分析系统
            </h1>
            <p className="text-slate-500 text-sm mt-1">数据智能分析平台</p>
          </div>

          <div className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="text-xs text-slate-400 text-center">
              本地运行 · 数据安全
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

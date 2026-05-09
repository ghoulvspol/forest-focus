'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '仪表盘', icon: '📊' },
  { href: '/assessment', label: 'AI评估', icon: '🎯' },
  { href: '/training', label: '训练计划', icon: '💪' },
  { href: '/exercise', label: '实时训练', icon: '🎮' },
  { href: '/achievements', label: '成就系统', icon: '🏆' },
  { href: '/progress', label: '康复报告', icon: '📈' },
  { href: '/chat', label: 'AI助手', icon: '🤖' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            R
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-gray-900 whitespace-nowrap">AI康复助手</h1>
              <p className="text-xs text-gray-500">RehabAI Pro</p>
            </div>
          )}
        </div>
      </div>

      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span className="text-sm">收起</span>}
        </button>
      </div>
    </aside>
  );
}

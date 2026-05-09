'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/helpers';
import { 
  LayoutDashboard, 
  Monitor, 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '智驾监控', href: '/monitor', icon: Monitor },
  { name: '驾驶分析', href: '/analysis', icon: BarChart3 },
  { name: '事故判定', href: '/accident', icon: AlertTriangle },
  { name: '驾驶报告', href: '/reports', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 min-h-screen p-4">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-gradient-to-br from-adas-blue to-cyan-500 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <div>
          <h1 className="text-white font-bold">智驾验证</h1>
          <p className="text-gray-500 text-xs">ADAS Verification</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive 
                  ? 'bg-adas-blue/20 text-adas-blue border border-adas-blue/30' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all w-full">
          <Settings className="w-5 h-5" />
          <span className="font-medium">设置</span>
        </button>
      </div>
    </div>
  );
}
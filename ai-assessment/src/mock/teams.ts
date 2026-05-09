import type { Team, AITool } from '../types';

export const teams: Team[] = [
  { id: 't1', name: '前端开发组', leaderId: 'm1', memberIds: ['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'] },
  { id: 't2', name: '后端开发组', leaderId: 'm11', memberIds: ['m11','m12','m13','m14','m15','m16','m17','m18','m19','m20'] },
  { id: 't3', name: '产品设计组', leaderId: 'm21', memberIds: ['m21','m22','m23','m24','m25','m26','m27','m28','m29','m30'] },
  { id: 't4', name: '测试运维组', leaderId: 'm31', memberIds: ['m31','m32','m33','m34','m35','m36','m37','m38','m39','m40'] },
  { id: 't5', name: '数据分析组', leaderId: 'm41', memberIds: ['m41','m42','m43','m44','m45','m46','m47','m48','m49','m50'] },
];

export const aiTools: AITool[] = [
  { id: 'tool1', name: 'ChatGPT', category: '对话', description: '通用AI对话助手', enabled: true },
  { id: 'tool2', name: 'GitHub Copilot', category: '编码', description: 'AI代码补全', enabled: true },
  { id: 'tool3', name: 'Claude', category: '对话', description: '深度对话与分析', enabled: true },
  { id: 'tool4', name: 'Midjourney', category: '设计', description: 'AI图像生成', enabled: true },
  { id: 'tool5', name: 'Cursor', category: '编码', description: 'AI编程IDE', enabled: true },
  { id: 'tool6', name: '通义千问', category: '对话', description: '阿里AI助手', enabled: true },
  { id: 'tool7', name: 'Stable Diffusion', category: '设计', description: '开源图像生成', enabled: true },
  { id: 'tool8', name: 'Notion AI', category: '写作', description: 'AI写作助手', enabled: true },
  { id: 'tool9', name: 'Copilot Chat', category: '编码', description: 'VS Code AI助手', enabled: true },
  { id: 'tool10', name: 'DeepSeek', category: '对话', description: '深度求索AI', enabled: true },
];

# 辅助驾驶验证应用 - 技术文档

## 1. 技术架构

### 1.1 系统架构
```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层 (UI)                        │
│  React + TypeScript + Tailwind CSS                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      业务逻辑层 (Logic)                      │
│  智驾监控 | 驾驶分析 | 事故判定 | 报告生成                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层 (Data)                          │
│  Zustand (状态管理) | 模拟数据生成器                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      存储层 (Storage)                        │
│  LocalStorage (本地数据持久化)                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.x | 框架 |
| React | 18.x | UI库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式 |
| Zustand | 4.x | 状态管理 |
| Recharts | 2.x | 图表 |
| Lucide React | 0.x | 图标 |

---

## 2. 模块设计

### 2.1 智驾监控模块

#### 2.1.1 功能
- 实时显示智驾状态
- 模拟不同智驾模式
- 状态变化动画

#### 2.1.2 数据结构
```typescript
interface ADASStatus {
  mode: 'NOA' | 'LCC' | 'ACC' | 'APA' | 'OFF';
  isActive: boolean;
  speed: number;
  laneKeep: boolean;
  followDistance: number;
  speedLimit: number;
  activeTime: number;
}
```

### 2.2 驾驶分析模块

#### 2.2.1 功能
- 记录驾驶事件
- 计算安全评分
- 生成统计数据

#### 2.2.2 数据结构
```typescript
interface DrivingEvent {
  id: string;
  type: 'hard_brake' | 'rapid_acceleration' | 'lane_change' | 'speeding' | 'takeover';
  timestamp: number;
  details: {
    speed?: number;
    location?: string;
  };
}

interface DrivingStats {
  totalDistance: number;
  totalTime: number;
  adasTime: number;
  takeoverCount: number;
  safetyScore: number;
  events: DrivingEvent[];
}
```

### 2.3 事故判定模块

#### 2.3.1 功能
- 事故检测模拟
- 智驾状态回溯
- 判定结果输出

#### 2.3.2 判定逻辑
```typescript
interface AccidentCase {
  id: string;
  timestamp: number;
  adasStatus: ADASStatus;
  vehicleData: {
    speed: number;
    brakeStatus: string;
    steeringAngle: number;
  };
  judgment: 'pending' | 'adas_accident' | 'normal_accident' | 'unclear';
  judgmentTime?: number;
  result?: string;
}
```

### 2.4 报告生成模块

#### 2.4.1 功能
- 生成驾驶报告
- 数据可视化
- 历史记录

#### 2.4.2 报告结构
```typescript
interface DrivingReport {
  id: string;
  date: string;
  period: 'daily' | 'weekly' | 'monthly';
  summary: {
    totalDistance: number;
    totalTime: number;
    adasCoverage: number;
    safetyScore: number;
  };
  details: {
    events: DrivingEvent[];
    scores: number[];
    recommendations: string[];
  };
}
```

---

## 3. 页面设计

### 3.1 首页（仪表盘）

#### 布局
- 顶部：安全评分卡片
- 中部：智驾状态仪表
- 底部：快捷操作入口

#### 组件
- `ScoreCard`：显示当前评分
- `StatusGauge`：智驾状态仪表
- `QuickActions`：快捷操作

### 3.2 智驾监控页

#### 布局
- 左侧：状态指示
- 中部：模拟仪表盘
- 右侧：详细数据

#### 组件
- `ADASDashboard`：仪表盘主体
- `ModeIndicator`：模式指示
- `StatusPanel`：状态面板

### 3.3 驾驶分析页

#### 布局
- 顶部：统计概览
- 中部：图表展示
- 底部：事件列表

#### 组件
- `StatsOverview`：统计概览
- `TrendChart`：趋势图表
- `EventList`：事件列表

### 3.4 事故判定页

#### 布局
- 左侧：案例列表
- 中部：判定工具
- 右侧：结果展示

#### 组件
- `CaseList`：案例列表
- `JudgmentPanel`：判定面板
- `ResultDisplay`：结果展示

### 3.5 报告页

#### 布局
- 顶部：筛选器
- 中部：报告卡片
- 底部：详情

#### 组件
- `ReportFilter`：筛选器
- `ReportCard`：报告卡片
- `ReportDetail`：报告详情

---

## 4. API设计

### 4.1 内部接口

```typescript
// 智驾状态
interface ADASService {
  getStatus(): ADASStatus;
  setMode(mode: ADASMode): void;
  toggle(): void;
}

// 驾驶分析
interface DrivingService {
  getStats(): DrivingStats;
  recordEvent(event: DrivingEvent): void;
  calculateScore(): number;
}

// 事故判定
interface AccidentService {
  createCase(data: Partial<AccidentCase>): AccidentCase;
  judge(caseId: string): JudgmentResult;
  getCases(): AccidentCase[];
}

// 报告生成
interface ReportService {
  generate(type: ReportType): DrivingReport;
  getHistory(): DrivingReport[];
  getDetail(id: string): DrivingReport;
}
```

---

## 5. 数据流

### 5.1 状态管理
```
Zustand Store
├── adasStore: ADAS状态
├── drivingStore: 驾驶数据
├── accidentStore: 事故数据
└── reportStore: 报告数据
```

### 5.2 数据流向
```
用户操作 → Action → Store更新 → UI渲染
                    ↓
              LocalStorage (持久化)
```

---

## 6. 实现细节

### 6.1 模拟数据生成
- 随机生成智驾状态变化
- 模拟驾驶事件
- 生成测试事故案例

### 6.2 评分算法
```
安全评分 = 100 - (急刹车*10 + 急加速*5 + 接管*15 + 超速*20)
智驾覆盖率 = 智驾时长 / 总时长 * 100%
```

### 6.3 判定算法
```
IF 速度变化 > 阈值 AND 制动触发 THEN
  检测到事故
  IF 智驾开启 AND 智驾功能正常 THEN
    返回智驾事故
  ELSE
    返回普通事故
```

---

## 7. 目录结构

```
adas-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── monitor/
│   │   │   └── page.tsx
│   │   ├── analysis/
│   │   │   └── page.tsx
│   │   ├── accident/
│   │   │   └── page.tsx
│   │   └── reports/
│   │       └── page.tsx
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── ADASStatus.tsx
│   │   ├── Chart.tsx
│   │   ├── CaseList.tsx
│   │   └── ReportCard.tsx
│   ├── stores/
│   │   ├── adasStore.ts
│   │   ├── drivingStore.ts
│   │   └── reportStore.ts
│   ├── services/
│   │   ├── simulator.ts
│   │   └── judge.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── helpers.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## 8. 参考实现

### 8.1 特斯拉风格
- 深色主题
- 简约仪表盘
- 实时数据展示

### 8.2 小鹏风格
- 科技感UI
- 详细数据分析
- 趋势图表展示
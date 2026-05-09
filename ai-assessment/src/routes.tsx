import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PersonalDashboard from './pages/dashboard/PersonalDashboard';
import TeamDashboard from './pages/dashboard/TeamDashboard';
import ScoreOverview from './pages/scoring/ScoreOverview';
import ScoreDetail from './pages/scoring/ScoreDetail';
import DataEntry from './pages/data/DataEntry';
import DataImport from './pages/data/DataImport';
import Leaderboard from './pages/leaderboard/Leaderboard';
import NotificationCenter from './pages/notification/NotificationCenter';
import MemberManage from './pages/admin/MemberManage';
import ToolManage from './pages/admin/ToolManage';
import RuleConfig from './pages/admin/RuleConfig';
import DataExport from './pages/admin/DataExport';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <PersonalDashboard /> },
      { path: 'team', element: <TeamDashboard /> },
      { path: 'scoring', element: <ScoreOverview /> },
      { path: 'scoring/:memberId', element: <ScoreDetail /> },
      { path: 'data', element: <DataEntry /> },
      { path: 'data/import', element: <DataImport /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'notifications', element: <NotificationCenter /> },
      { path: 'admin/members', element: <MemberManage /> },
      { path: 'admin/tools', element: <ToolManage /> },
      { path: 'admin/rules', element: <RuleConfig /> },
      { path: 'admin/export', element: <DataExport /> },
    ],
  },
]);

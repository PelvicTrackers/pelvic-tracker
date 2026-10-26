import React from 'react';
import { HeartPulse, Droplets, CircleGauge, FileText, TrendingUp, ClipboardList } from 'lucide-react';
import { useLogStore } from '../../store/useLogStore';
import type { AppTab } from '../../types';

export const BottomNav: React.FC = () => {
  const activeTab = useLogStore((s) => s.activeTab);
  const setActiveTab = useLogStore((s) => s.setActiveTab);

  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'sexual', label: 'Sexual Health', icon: <HeartPulse size={20} /> },
    { id: 'urinary', label: 'Bladder Diary', icon: <Droplets size={20} /> },
    { id: 'bowel', label: 'Bowel Diary', icon: <CircleGauge size={20} /> },
    { id: 'customForms', label: 'Custom Forms', icon: <ClipboardList size={20} /> },
    { id: 'notes', label: 'Notes & PT', icon: <FileText size={20} /> },
    { id: 'analytics', label: 'Trends', icon: <TrendingUp size={20} /> }
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={isActive}
            role="tab"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

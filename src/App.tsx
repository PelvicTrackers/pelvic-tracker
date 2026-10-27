import { useEffect } from 'react';
import { useLogStore } from './store/useLogStore';
import { TopNav } from './components/common/TopNav';
import { BottomNav } from './components/common/BottomNav';
import { PrivacyNoticeModal } from './components/common/PrivacyNoticeModal';
import { AnatomyOnboardingModal } from './components/common/AnatomyOnboardingModal';
import { SettingsModal } from './components/common/SettingsModal';
import { ExportModal } from './components/export/ExportModal';
import { PrintableClinicalReport } from './components/export/PrintableClinicalReport';
import { SexualLogView } from './components/sexual/SexualLogView';
import { UrinaryLogView } from './components/urinary/UrinaryLogView';
import { BowelLogView } from './components/bowel/BowelLogView';
import { NotesView } from './components/notes/NotesView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CustomFormsView } from './components/customForms/CustomFormsView';

export function App() {
  const activeTab = useLogStore((s) => s.activeTab);
  const showPrivacyModal = useLogStore((s) => s.showPrivacyModal);
  const setShowPrivacyModal = useLogStore((s) => s.setShowPrivacyModal);
  const initApp = useLogStore((s) => s.initApp);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <div className="app-container">
      <TopNav />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'sexual' && <SexualLogView />}
        {activeTab === 'urinary' && <UrinaryLogView />}
        {activeTab === 'bowel' && <BowelLogView />}
        {activeTab === 'customForms' && <CustomFormsView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      <BottomNav />

      {/* Global Modals */}
      <PrivacyNoticeModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <ExportModal />
      <AnatomyOnboardingModal />
      <SettingsModal />

      {/* Hidden clinical view rendered during window.print() */}
      <PrintableClinicalReport />
    </div>
  );
}

export default App;

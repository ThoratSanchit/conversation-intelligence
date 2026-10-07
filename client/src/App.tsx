import React from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { OverviewPage, LeadsPage, LeadDetailPage, ImportPage } from './pages';

const AppContent: React.FC = () => {
  const { page } = useRouter();

  switch (page) {
    case 'overview':
      return <OverviewPage />;
    case 'leads':
      return <LeadsPage />;
    case 'lead-detail':
      return <LeadDetailPage />;
    case 'import':
      return <ImportPage />;
    default:
      return <OverviewPage />;
  }
};

export const App: React.FC = () => {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
};

export default App;

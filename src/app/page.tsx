'use client';

import { useUIStore } from '@/store/uiStore';
import { LandingPageView } from '@/components/landing/LandingPageView';
import { DashboardView }    from '@/components/dashboard/DashboardView';
import { AppointmentsView } from '@/components/appointments/AppointmentsView';
import { PatientsView }     from '@/components/patients/PatientsView';
import { WhatsAppView }     from '@/components/whatsapp/WhatsAppView';
import { VoiceCallsView }   from '@/components/voice/VoiceCallsView';
import { ReportsView }      from '@/components/reports/ReportsView';
import { CSATView }         from '@/components/csat/CSATView';
import { AnalyticsView }    from '@/components/analytics/AnalyticsView';
import { WorkflowsView }    from '@/components/workflows/WorkflowsView';
import { SettingsView }     from '@/components/settings/SettingsView';
import { SuperAdminView }   from '@/components/admin/SuperAdminView';

export default function HomePage() {
  const { activeView } = useUIStore();

  return (
    <div className="animate-fade-in" key={activeView}>
      {activeView === 'landing'      && <LandingPageView />}
      {activeView === 'super_admin'  && <SuperAdminView />}
      {activeView === 'dashboard'    && <DashboardView />}
      {activeView === 'appointments' && <AppointmentsView />}
      {activeView === 'patients'     && <PatientsView />}
      {activeView === 'whatsapp'     && <WhatsAppView />}
      {activeView === 'voice-calls'  && <VoiceCallsView />}
      {activeView === 'reports'      && <ReportsView />}
      {activeView === 'csat'         && <CSATView />}
      {activeView === 'analytics'    && <AnalyticsView />}
      {activeView === 'workflows'    && <WorkflowsView />}
      {activeView === 'settings'     && <SettingsView />}
    </div>
  );
}

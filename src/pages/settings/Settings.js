import React from 'react';
import { Layout, Tabs, Typography } from 'antd';
import FormsManagement from './pages/forms/FormsManagement';
import ReferralSettings from './pages/ReferralSettings'; // Import the new component
import PatientNoteTemplateSettings from './pages/PatientNoteTemplateSettings'; // Import the new component
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  FormOutlined,
  UserOutlined,
  GiftOutlined, // Import Gift icon for Referrals
  SnippetsOutlined, // Import icon for Note Templates
} from '@ant-design/icons';

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which tab should be active based on the current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/settings/forms')) return 'forms';
    if (path.includes('/settings/account')) return 'account';
    if (path.includes('/settings/referrals')) return 'referrals';
    if (path.includes('/settings/note-templates')) return 'note-templates'; // Add note-templates tab key
    return 'forms'; // Default to forms
  };

  // Handle tab change
  const handleTabChange = (key) => {
    navigate(`/settings/${key}`);
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="px-6">
        <div className="sticky top-[-2rem] z-10 bg-gray-100 pt-4 pb-2">
          <Title level={3} className="mb-4">
            Settings
          </Title>
          <Tabs
            activeKey={getActiveTab()}
            onChange={handleTabChange}
            tabPosition="top"
            className="mb-6 bg-white p-4 rounded shadow-sm"
          >
            <TabPane
              tab={
                <span>
                  <FormOutlined />
                  Forms
                </span>
              }
              key="forms"
            />
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Account
                </span>
              }
              key="account"
            />
            <TabPane
              tab={
                <span>
                  <GiftOutlined />
                  Referrals
                </span>
              }
              key="referrals"
            />
             <TabPane
              tab={
                <span>
                  <SnippetsOutlined />
                  Note Templates
                </span>
              }
              key="note-templates" // Add note templates tab
            />
          </Tabs>
        </div>

        <div className="bg-white p-6 rounded shadow-sm min-h-[600px] mt-4">
          <Routes>
            <Route path="/forms" element={<FormsManagement />} />
            <Route
              path="/account"
              element={<div>Account Settings (Coming Soon)</div>}
            />
            {/* Use ReferralSettings component */}
            <Route path="/referrals" element={<ReferralSettings />} />
            <Route path="/note-templates" element={<PatientNoteTemplateSettings />} /> {/* Add route for note templates */}
            {/* Update default route or add redirect if needed */}
            <Route path="*" element={<FormsManagement />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Sparkles, Settings, List, BarChart2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAIPrompts } from '../../apis/ai/hooks';
import PromptManagement from '../../components/ai/PromptManagement';
import AISettings from '../../components/ai/AISettings';
import AIMetrics from '../../components/ai/AIMetrics';
import AILogs from '../../components/ai/AILogs';

const AIDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  const { data: prompts, isLoading } = useAIPrompts();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prompts':
        return <PromptManagement prompts={prompts} isLoading={isLoading} />;
      case 'settings':
        return <AISettings />;
      case 'metrics':
        return <AIMetrics />;
      case 'logs':
        return <AILogs />;
      default:
        return <PromptManagement prompts={prompts} isLoading={isLoading} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader 
        title="AI Dashboard" 
        subtitle="Manage AI prompts and settings"
        icon={<Sparkles className="h-6 w-6 text-blue-500" />}
      />
      
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'prompts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Prompts
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" />
                Metrics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Logs
              </div>
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {isLoading && activeTab === 'prompts' ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboardPage;

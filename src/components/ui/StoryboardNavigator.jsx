import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Button, Input, Empty } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const StoryboardNavigator = ({ onNavigate }) => {
  const [storyboards, setStoryboards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // This would normally fetch from an API, but for demo we'll use mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockStoryboards = [
        {
          id: 'shopping-cart',
          name: 'Shopping Cart',
          path: '/storyboards/shopping-cart',
        },
        {
          id: 'form-viewer',
          name: 'Form Viewer',
          path: '/storyboards/form-viewer',
        },
        {
          id: 'default-node',
          name: 'Default Node',
          path: '/storyboards/default-node',
        },
        {
          id: 'system-map-sidebar',
          name: 'System Map Sidebar',
          path: '/storyboards/system-map-sidebar',
        },
        {
          id: 'sortable-form-element',
          name: 'Sortable Form Element',
          path: '/storyboards/sortable-form-element',
        },
        {
          id: 'forms-management',
          name: 'Forms Management',
          path: '/storyboards/forms-management',
        },
        {
          id: 'ui-components',
          name: 'UI Components',
          path: '/storyboards/ui-components',
        },
        {
          id: 'form-components-group',
          name: 'Form Components Group',
          path: '/storyboards/form-components-group',
        },
        {
          id: 'patient-components-group',
          name: 'Patient Components Group',
          path: '/storyboards/patient-components-group',
        },
        {
          id: 'system-map-components',
          name: 'System Map Components',
          path: '/storyboards/system-map-components',
        },
        {
          id: 'simple-test',
          name: 'Simple Test',
          path: '/storyboards/simple-test',
        },
      ];
      setStoryboards(mockStoryboards);
      setLoading(false);
    }, 800);
  }, []);

  const filteredStoryboards = storyboards.filter((sb) =>
    sb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback if no navigation handler is provided
      console.log(`Navigate to: ${path}`);
    }
  };

  return (
    <Card
      title={<Title level={4}>Storyboard Navigator</Title>}
      className="shadow-md"
      extra={
        <Text className="font-handwritten text-accent2">
          Find your components
        </Text>
      }
    >
      <div className="mb-4">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search storyboards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <Text className="text-gray-500 mt-4">Loading storyboards...</Text>
        </div>
      ) : filteredStoryboards.length > 0 ? (
        <List
          dataSource={filteredStoryboards}
          renderItem={(item) => (
            <List.Item
              className="hover:bg-gray-50 rounded cursor-pointer transition-colors"
              onClick={() => handleNavigate(item.path)}
            >
              <List.Item.Meta
                avatar={<FileOutlined className="text-accent3 text-lg" />}
                title={item.name}
                description={`ID: ${item.id}`}
              />
              <Button type="link" size="small">
                View
              </Button>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No storyboards found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Text type="secondary" className="text-xs">
          {storyboards.length} total storyboards available
        </Text>
      </div>
    </Card>
  );
};

export default StoryboardNavigator;

import React, { useState } from 'react';
import { Tabs, Button, Space, Input, Tooltip, Popconfirm } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;

// Component to manage form pages (tabs)
const FormPages = ({
  pages,
  currentPageIndex,
  onChangePage,
  onAddPage,
  onDeletePage,
  onUpdatePageTitle,
}) => {
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Start editing a page title
  const startEditingTitle = (index, title) => {
    setEditingPageIndex(index);
    setEditingTitle(title);
  };

  // Save the edited page title
  const savePageTitle = () => {
    if (editingTitle.trim()) {
      onUpdatePageTitle(editingPageIndex, editingTitle.trim());
    }
    setEditingPageIndex(null);
  };

  // Cancel editing
  const cancelEditingTitle = () => {
    setEditingPageIndex(null);
  };

  // Handle key press in the title input (save on Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      savePageTitle();
    }
  };

  // Render the tab title with editing capability
  const renderTabTitle = (page, index) => {
    if (editingPageIndex === index) {
      return (
        <div
          className="edit-title-container"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            size="small"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={savePageTitle}
            onKeyPress={handleKeyPress}
            autoFocus
            style={{ width: 120 }}
          />
          <Space className="edit-actions">
            <Button
              size="small"
              type="text"
              icon={<SaveOutlined />}
              onClick={savePageTitle}
            />
            <Button
              size="small"
              type="text"
              icon={<CloseOutlined />}
              onClick={cancelEditingTitle}
            />
          </Space>
        </div>
      );
    }

    return (
      <div className="page-title-container">
        <span className="page-title">{page.title}</span>
        <Space className="page-actions">
          <Tooltip title="Edit Page Title">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                startEditingTitle(index, page.title);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this page?"
            onConfirm={(e) => {
              e.stopPropagation();
              onDeletePage(index);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Page">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>
    );
  };

  return (
    <div className="form-pages-container">
      <Tabs
        activeKey={currentPageIndex.toString()}
        onChange={(key) => onChangePage(parseInt(key))}
        type="editable-card"
        onEdit={(targetKey, action) => {
          if (action === 'add') {
            onAddPage();
          }
        }}
        className="page-tabs"
      >
        {pages.map((page, index) => (
          <TabPane
            tab={renderTabTitle(page, index)}
            key={index.toString()}
            closable={false}
          >
            {/* TabPane needs to have a child even though we're not using it */}
            <div></div>
          </TabPane>
        ))}
      </Tabs>

      <style jsx>{`
        .form-pages-container {
          background: #f5f5f5;
          border-bottom: 1px solid #e8e8e8;
          padding: 0 16px;
        }

        .page-title-container {
          display: flex;
          align-items: center;
          max-width: 200px;
        }

        .page-title {
          margin-right: 8px;
        }

        .page-actions {
          display: none;
          margin-left: 8px;
        }

        .page-title-container:hover .page-actions {
          display: flex;
        }

        .edit-title-container {
          display: flex;
          align-items: center;
        }

        .edit-actions {
          margin-left: 8px;
        }

        :global(.page-tabs .ant-tabs-nav-add) {
          background: white;
          border: 1px dashed #d9d9d9;
          border-radius: 2px;
          margin-left: 8px;
        }

        :global(.page-tabs .ant-tabs-tab) {
          background: white;
          border: 1px solid #d9d9d9;
          margin-right: 8px;
        }

        :global(.page-tabs .ant-tabs-tab-active) {
          background: #f0f7ff;
          border-color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default FormPages;

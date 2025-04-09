import React from 'react';
import {
  Table,
  Button,
  Space,
  Tooltip,
  Tag,
  Popconfirm,
  Empty,
  Menu,
  Dropdown,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';

const FormTable = ({
  forms,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onPreview,
  onToggleStatus,
  onAdd, // Function to trigger adding a new form
}) => {
  // Table columns configuration
  const columns = [
    {
      title: 'Form Name',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <span className="font-medium text-gray-900">{text}</span>
          <div>
            <span className="text-xs text-gray-500">{record.description}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      render: (name) => name || '-',
    },
    {
      title: 'Type',
      dataIndex: 'form_type',
      key: 'form_type',
      render: (type) =>
        type?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) ||
        '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isActive = status === 'active';
        const color = isActive ? 'success' : 'error'; // Use Ant Design status colors
        const text = isActive ? 'Active' : 'Inactive';
        const actionText = isActive ? 'Deactivate' : 'Activate';

        return (
          <Tooltip title={`Click to ${actionText}`}>
            <Popconfirm
              title={`Are you sure you want to ${actionText.toLowerCase()} this form?`}
              onConfirm={() => onToggleStatus(record.id, status)}
              okText="Yes"
              cancelText="No"
            >
              <Tag color={color} style={{ cursor: 'pointer' }}>
                {text}
              </Tag>
            </Popconfirm>
          </Tooltip>
        );
      },
    },
    {
      title: 'Pages',
      dataIndex: 'pageCount',
      key: 'pageCount',
      sorter: (a, b) => a.pageCount - b.pageCount,
    },
    {
      title: 'Fields',
      dataIndex: 'elementCount',
      key: 'elementCount',
      sorter: (a, b) => a.elementCount - b.elementCount,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Form">
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} size="small" />
          </Tooltip>

          <Dropdown
            overlay={
              <Menu>
                <Menu.Item
                  key="duplicate"
                  icon={<CopyOutlined />}
                  onClick={() => onDuplicate(record)}
                >
                  Duplicate
                </Menu.Item>
                <Menu.Item
                  key="share"
                  icon={<ShareAltOutlined />}
                  onClick={() => onShare(record)}
                >
                  Share
                </Menu.Item>
                <Menu.Item
                  key="preview"
                  icon={<EyeOutlined />}
                  onClick={() => onPreview(record)}
                >
                  Preview
                </Menu.Item>
                <Menu.Divider />
                 <Menu.Item key="toggle-status" onClick={() => onToggleStatus(record.id, record.status)}>
                   {record.status === 'active' ? 'Deactivate' : 'Activate'}
                 </Menu.Item>
                <Menu.Divider />
                <Popconfirm
                   title="Are you sure you want to delete this form?"
                   onConfirm={() => onDelete(record.id)}
                   okText="Yes"
                   cancelText="No"
                   placement="left"
                 >
                   <Menu.Item key="delete" icon={<DeleteOutlined />} danger>
                     Delete
                   </Menu.Item>
                 </Popconfirm>
              </Menu>
            }
            trigger={['click']}
          >
             <Tooltip title="More Actions">
               <Button icon={<MoreOutlined />} size="small" />
             </Tooltip>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={forms}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      loading={loading}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No forms found.{' '}
                <Button type="link" onClick={onAdd}>
                  Create your first form
                </Button>
              </span>
            }
          />
        ),
      }}
    />
  );
};

export default FormTable;

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
      render: (status, record) => (
        <Popconfirm
          title={`Are you sure you want to ${
            status === 'active' ? 'deactivate' : 'activate'
          } this form?`}
          onConfirm={() => onToggleStatus(record.id, status)}
          okText="Yes"
          cancelText="No"
        >
          <Tag
            color={status === 'active' ? 'green' : 'red'}
            style={{ cursor: 'pointer' }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        </Popconfirm>
      ),
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
            <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
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
                <Menu.Item
                  key="delete"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => onDelete(record.id)}
                >
                  Delete
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button icon={<MoreOutlined />} />
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

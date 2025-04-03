import React, { useState } from 'react';
import { Typography, Table, Tag, Spin, Alert } from 'antd';
import { useAuditLogs } from '../../apis/auditlog/hooks'; // Import the hook
import errorHandling from '../../utils/errorHandling'; // Import error handling

const { Title } = Typography;

const AuditLogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // Default page size

  // Fetch data using the hook, passing pagination params
  const { data, isLoading, error, isFetching } = useAuditLogs({
    page: currentPage,
    limit: pageSize,
    // TODO: Add filters here if needed, e.g., filters: { userId: '...', action: '...' }
  });

  // Extract logs and total count from data (adjust based on actual API response structure)
  const auditLogs = data?.logs || [];
  const totalLogs = data?.total || 0;

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      defaultSortOrder: 'descend',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        let color = 'geekblue';
        if (action.includes('Deleted')) color = 'volcano';
        if (action.includes('Created')) color = 'green';
        if (action.includes('Updated')) color = 'gold';
        return <Tag color={color}>{action.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
    },
  ];

  // Handle loading state
  if (isLoading && !data) {
    // Show initial loading spinner
    return (
      <Spin
        tip="Loading audit logs..."
        size="large"
        className="flex justify-center items-center h-64"
      />
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert
        message="Error Loading Audit Logs"
        description={errorHandling.getErrorMessage(error)}
        type="error"
        showIcon
      />
    );
  }

  // Handle table pagination changes
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div>
      <Title level={2} className="mb-4">
        Audit Log
      </Title>
      <Table
        columns={columns}
        dataSource={auditLogs}
        rowKey="id"
        loading={isFetching} // Show loading indicator during refetches
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalLogs, // Total number of logs for pagination calculation
          showSizeChanger: true, // Allow changing page size
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange} // Handle page changes
        scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
      />
    </div>
  );
};

export default AuditLogPage;

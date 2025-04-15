import React, { useState, useMemo } from 'react'; // Keep only one React import
import { Typography, Table, Tag, Spin, Alert, Input, Space } from 'antd'; // Added Input, Space
import { useAuditLogs } from '../../apis/auditlog/hooks'; // Import the hook
import errorHandling from '../../utils/errorHandling'; // Import error handling
import { format, parseISO } from 'date-fns'; // Import date-fns

const { Title, Text } = Typography; // Added Text

const AuditLogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // --- Data Fetching ---
  const filters = useMemo(() => {
      const activeFilters = {};
      if (userIdFilter) activeFilters.userId = userIdFilter;
      if (actionFilter) activeFilters.action = actionFilter;
      // Add date range filters here if implemented
      return activeFilters;
  }, [userIdFilter, actionFilter]);

  // Fetch data using the hook, passing pagination and filters
  const { data: auditLogsQueryResult, isLoading, error, isFetching } = useAuditLogs(currentPage, filters, {
      // Pass limit via filters if hook supports it, otherwise handle via pageSize state
      // limit: pageSize
  });

  // Extract logs and pagination info from data
  const auditLogs = auditLogsQueryResult?.data || [];
  const paginationInfo = auditLogsQueryResult?.pagination || { totalCount: 0, totalPages: 1, itemsPerPage: pageSize };
  const totalLogs = paginationInfo.totalCount;

  // --- Table Columns ---
  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'created_at', // Use created_at from schema
      key: 'timestamp',
      render: (text) => text ? format(parseISO(text), 'MMM d, yyyy, p') : 'N/A', // Format date
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend',
    },
    {
      title: 'User',
      dataIndex: ['user', 'email'], // Access nested user email
      key: 'user',
      render: (email, record) => email || record.user_id || 'System', // Display email or ID
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
      render: (details) => (
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-20">
              {JSON.stringify(details, null, 2)}
          </pre>
      ),
      ellipsis: true, // Add ellipsis for long details
    },
     {
      title: 'Table',
      dataIndex: 'table_name',
      key: 'table_name',
      width: 120,
    },
    {
      title: 'Record ID',
      dataIndex: 'record_id',
      key: 'record_id',
      render: (id) => id ? <Text copyable={{ text: id }} ellipsis>{id}</Text> : '-',
      width: 150,
    },
  ];

  // Handle loading state
  if (isLoading && !auditLogsQueryResult) { // Show initial loading spinner
    return <Spin tip="Loading audit logs..." size="large" className="flex justify-center items-center h-64" />;
  }

  // Handle error state
  if (error) {
    return <Alert message="Error Loading Audit Logs" description={errorHandling.getErrorMessage(error)} type="error" showIcon />;
  }

  // Handle table pagination/filter/sort changes
  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    // TODO: Handle server-side sorting if implemented in API/hook
    // if (sorter.field && sorter.order) {
    //   setSortConfig({ key: sorter.field, direction: sorter.order === 'ascend' ? 'asc' : 'desc' });
    // } else {
    //   setSortConfig({ key: 'created_at', direction: 'desc' }); // Reset to default
    // }
  };

  return (
    <div>
      <Title level={2} className="mb-4">Audit Log</Title>

       {/* Filter Section */}
       <Space direction="vertical" size="middle" style={{ display: 'flex', marginBottom: 16 }}>
           <Space wrap>
                <Input
                    placeholder="Filter by User ID or Email"
                    value={userIdFilter}
                    onChange={e => setUserIdFilter(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                />
                <Input
                    placeholder="Filter by Action"
                    value={actionFilter}
                    onChange={e => setActionFilter(e.target.value)}
                    style={{ width: 200 }}
                    allowClear
                />
                {/* TODO: Add Date Range Picker */}
           </Space>
       </Space>

      <Table
        columns={columns}
        dataSource={auditLogs}
        rowKey="id"
        loading={isLoading || isFetching} // Show loading indicator
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalLogs,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default AuditLogPage;

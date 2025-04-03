import React, { useState, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  Statistic,
  Row,
  Col,
  Card,
  message,
  Spin,
  Table,
  Tag,
  Radio,
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
// import { useAppContext } from '../../../context/AppContext'; // Context might not be needed directly if using AuthContext
import { useAuth } from '../../../context/AuthContext'; // Assuming AuthContext provides user role
import apiService from '../../../utils/apiService'; // Use the actual apiService

const { Title, Paragraph, Text } = Typography;

// --- Helper Function for Status Tag Colors ---
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'rewarded':
      return 'success';
    case 'pending':
      return 'processing';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const ReferralSettings = () => {
  const { user } = useAuth(); // Get user info, assuming it includes role
  const isAdmin = user?.role === 'admin'; // Determine if user is admin based on role

  // State for User View
  const [referralCode, setReferralCode] = useState('LOADING...');
  const [referralStats, setReferralStats] = useState({ count: 0, rewards: 0 });
  const [isLoadingCode, setIsLoadingCode] = useState(!isAdmin);
  const [isLoadingStats, setIsLoadingStats] = useState(!isAdmin);

  // State for Admin View & Shared Settings
  const [rewardAmount, setRewardAmount] = useState(0);
  const [rewardRecipient, setRewardRecipient] = useState('referrer'); // 'referrer', 'referee', 'both'
  const [newRewardAmount, setNewRewardAmount] = useState('');
  const [newRewardRecipient, setNewRewardRecipient] = useState('referrer'); // For admin form
  const [allReferrals, setAllReferrals] = useState([]);
  const [isLoadingAdminSettings, setIsLoadingAdminSettings] = useState(true);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(isAdmin);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // --- API Fetch Functions ---
  const fetchUserReferralInfo = async () => {
    if (isAdmin) return;
    setIsLoadingCode(true);
    setIsLoadingStats(true);
    try {
      // Use the new apiService method
      const info = await apiService.users.getReferralInfo();
      setReferralCode(info?.code || 'N/A');
      // Adjust keys based on actual API response structure
      setReferralStats({
        count: info?.referralCount || 0,
        rewards: info?.totalRewards || 0,
      });
    } catch (error) {
      console.error('Error fetching user referral info:', error); // Log the actual error
      message.error('Failed to load your referral information.');
      setReferralCode('Error');
      setReferralStats({ count: 0, rewards: 0 });
    } finally {
      setIsLoadingCode(false);
      setIsLoadingStats(false);
    }
  };

  const fetchReferralSettings = async () => {
    setIsLoadingAdminSettings(true);
    try {
      // Use the new apiService method
      const settings = await apiService.referrals.getSettings();
      const currentAmount = settings?.rewardAmount || 0;
      const currentRecipient = settings?.rewardRecipient || 'referrer';

      setRewardAmount(currentAmount);
      setRewardRecipient(currentRecipient);

      if (isAdmin) {
        setNewRewardAmount(currentAmount.toString());
        setNewRewardRecipient(currentRecipient);
      }
    } catch (error) {
      console.error('Error fetching referral settings:', error); // Log the actual error
      message.error('Failed to load referral settings.');
      setRewardAmount(0);
      setRewardRecipient('referrer');
    } finally {
      setIsLoadingAdminSettings(false);
    }
  };

  const fetchAllReferrals = async () => {
    if (!isAdmin) return;
    setIsLoadingReferrals(true);
    try {
      // Use the new apiService method
      const data = await apiService.referrals.getAllAdmin();
      // Adjust key based on actual API response structure
      setAllReferrals(data?.referrals || []);
    } catch (error) {
      console.error('Error fetching referral history:', error); // Log the actual error
      message.error('Failed to load referral history.');
      setAllReferrals([]);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!isAdmin) return;
    const amount = parseFloat(newRewardAmount);
    if (isNaN(amount) || amount < 0) {
      message.error('Please enter a valid non-negative reward amount.');
      return;
    }
    setIsUpdatingSettings(true);
    try {
      // Use the new apiService method
      const updatedSettings = await apiService.referrals.updateSettings({
        rewardAmount: amount,
        rewardRecipient: newRewardRecipient,
      });
      // Update local state from the response to be sure
      setRewardAmount(updatedSettings?.rewardAmount || amount);
      setRewardRecipient(
        updatedSettings?.rewardRecipient || newRewardRecipient
      );
      message.success('Referral settings updated successfully!');
    } catch (error) {
      console.error('Error updating referral settings:', error); // Log the actual error
      message.error('Failed to update referral settings.');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  useEffect(() => {
    fetchReferralSettings(); // Fetch settings for all users
    if (!isAdmin) {
      fetchUserReferralInfo();
    } else {
      fetchAllReferrals();
    }
  }, [isAdmin]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(referralCode)
      .then(() => message.success('Referral code copied to clipboard!'))
      .catch(() => message.error('Failed to copy referral code.'));
  };

  // --- Admin Table Columns ---
  const referralTableColumns = [
    {
      title: 'Referrer',
      dataIndex: 'referrerName',
      key: 'referrerName',
      render: (text, record) => (
        <span>
          {text}
          <br />
          <small className="text-gray-500">{record.referrerEmail}</small>
        </span>
      ),
    },
    {
      title: 'Referred User',
      dataIndex: 'referredName',
      key: 'referredName',
      render: (text, record) => (
        <span>
          {text}
          <br />
          <small className="text-gray-500">{record.referredEmail}</small>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Signed Up',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Completed On',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Rewarded On',
      dataIndex: 'rewardedAt',
      key: 'rewardedAt',
      render: (date) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: 'Reward',
      dataIndex: 'rewardAmount',
      key: 'rewardAmount',
      render: (amount) => (amount !== null ? `$${amount.toFixed(2)}` : '-'),
    },
  ];

  // --- Dynamic Text for User View ---
  const getRewardDescription = () => {
    if (isLoadingAdminSettings) return '...';
    const amountText = `$${rewardAmount.toFixed(2)} account credit`;
    switch (rewardRecipient) {
      case 'referee':
        return `your friend will receive ${amountText}.`;
      case 'both':
        return `you and your friend will both receive ${amountText}.`;
      case 'referrer':
      default:
        return `you'll receive ${amountText}.`;
    }
  };

  // --- Render Logic ---
  if (isAdmin) {
    // --- Admin View ---
    return (
      <div>
        <Title level={4} className="mb-6">
          Referral Program Settings
        </Title>
        <Spin spinning={isLoadingAdminSettings}>
          <Card className="mb-6">
            <Title level={5}>Reward Configuration</Title>
            <Row gutter={[16, 24]} align="bottom">
              {/* Reward Amount */}
              <Col xs={24} md={12}>
                <Statistic
                  title="Current Amount (per referral)"
                  value={rewardAmount}
                  prefix="$"
                  precision={2}
                />
                <div className="flex items-end space-x-2 mt-4">
                  <div className="flex-grow">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Set New Amount
                    </label>
                    <Input
                      prefix="$"
                      value={newRewardAmount}
                      onChange={(e) => setNewRewardAmount(e.target.value)}
                      placeholder="e.g., 5.00"
                      disabled={isUpdatingSettings || isLoadingAdminSettings}
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </Col>
              {/* Reward Recipient */}
              <Col xs={24} md={12}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Recipient
                </label>
                <Radio.Group
                  onChange={(e) => setNewRewardRecipient(e.target.value)}
                  value={newRewardRecipient}
                  disabled={isUpdatingSettings || isLoadingAdminSettings}
                >
                  <Radio value="referrer">Referrer Only</Radio>
                  <Radio value="referee">Referee Only</Radio>
                  <Radio value="both">Both</Radio>
                </Radio.Group>
                <Button
                  type="primary"
                  onClick={handleUpdateSettings} // Updated handler
                  loading={isUpdatingSettings}
                  disabled={isLoadingAdminSettings}
                  className="mt-4 w-full" // Make button full width on small screens
                >
                  Update Settings
                </Button>
              </Col>
            </Row>
          </Card>
        </Spin>

        <Title level={4} className="mt-8 mb-6">
          Referral History
        </Title>
        <Card>
          <Table
            columns={referralTableColumns}
            dataSource={allReferrals}
            loading={isLoadingReferrals}
            rowKey="id"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </div>
    );
  } else {
    // --- Regular User View ---
    return (
      <div>
        <Title level={4} className="mb-6">
          Your Referrals
        </Title>

        <Card className="mb-6">
          <Title level={5}>Your Referral Code</Title>
          {isLoadingCode ? (
            <Spin size="small" />
          ) : (
            <div className="flex items-center space-x-2">
              <Text strong code style={{ fontSize: '1.1em' }}>
                {referralCode}
              </Text>
              <Button
                icon={<CopyOutlined />}
                onClick={copyToClipboard}
                disabled={
                  isLoadingCode ||
                  referralCode === 'LOADING...' ||
                  referralCode === 'Error'
                }
              />
            </div>
          )}
          <Paragraph type="secondary" className="mt-2">
            Share this code with friends! When they sign up and complete their
            first paid order, {getRewardDescription()}
          </Paragraph>
        </Card>

        <Title level={5} className="mb-4">
          Referral Stats
        </Title>
        <Spin spinning={isLoadingStats || isLoadingAdminSettings}>
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Successful Referrals"
                  value={referralStats.count}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total Credit Earned"
                  value={referralStats.rewards}
                  prefix="$"
                  precision={2}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
        {/* Optionally show list of user's own referrals */}
      </div>
    );
  }
};

export default ReferralSettings;

import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, Button, message } from 'antd';
// import { useAppContext } from '../../../context/AppContext'; // To get users/patients
// import apiService from '../../../utils/apiService'; // To send message

const { TextArea } = Input;
const { Option } = Select;

const NewConversationModal = ({ visible, onClose, onSubmitSuccess }) => {
  // const { patients, users } = useAppContext(); // Assuming users/team members are also in context or fetched separately
  const [recipients, setRecipients] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);

  // --- Mock Data & Fetching Simulation ---
  // Replace with actual data fetching and user/patient lists from context/API
  const mockUsers = [
    { id: 'user_1', name: 'Dr. Bob (Team)', type: 'team' },
    { id: 'user_2', name: 'Admin Sarah', type: 'team' },
  ];
  const mockPatients = [
    { id: 'pat_1', name: 'Patient Alice', type: 'patient' },
    { id: 'pat_3', name: 'Patient Charlie', type: 'patient' },
  ];

  useEffect(() => {
    if (visible) {
      // Combine and format users and patients for the Select component
      const combinedOptions = [
        ...mockUsers.map((u) => ({
          label: `${u.name} (Team)`,
          value: `team_${u.id}`,
        })),
        ...mockPatients.map((p) => ({
          label: `${p.name} (Patient)`,
          value: `patient_${p.id}`,
        })),
      ];
      setSearchOptions(combinedOptions);
      // Reset form state when modal opens
      setRecipients([]);
      setMessageBody('');
    }
  }, [visible]); // Rerun when modal visibility changes

  const handleRecipientChange = (value) => {
    setRecipients(value);
  };

  const handleSendMessage = async () => {
    if (recipients.length === 0) {
      message.error('Please select at least one recipient.');
      return;
    }
    if (!messageBody.trim()) {
      message.error('Please enter a message.');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare payload for API
      const payload = {
        recipientIds: recipients, // The values are like "team_1", "patient_3"
        message: messageBody,
      };
      console.log('Sending new message payload:', payload);
      // Placeholder for API call
      // await apiService.messaging.createConversation(payload);
      await new Promise((res) => setTimeout(res, 1000)); // Simulate API delay

      message.success('Message sent successfully!');
      onSubmitSuccess(); // Callback to potentially refresh conversation list
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="New Message"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isLoading}
          onClick={handleSendMessage}
        >
          Send Message
        </Button>,
      ]}
      width={600} // Adjust width as needed
    >
      <Select
        mode="multiple"
        allowClear
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="Select recipients (Patients or Team)"
        value={recipients}
        onChange={handleRecipientChange}
        options={searchOptions}
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        disabled={isLoading}
      />
      <TextArea
        rows={4}
        placeholder="Type your message here..."
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
        disabled={isLoading}
      />
    </Modal>
  );
};

export default NewConversationModal;

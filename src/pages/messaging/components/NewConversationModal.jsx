import React, { useState, useEffect } from 'react';
import { Modal, Select, Input, Button, Radio, Spin, message } from 'antd';
import { useCreateConversation } from '../../../apis/messaging/hooks';
import { useAuth } from '../../../contexts/auth/AuthContext';
import { isEncryptionAvailable } from '../../../utils/encryption';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const { TextArea } = Input;

/**
 * NewConversationModal component
 * 
 * Modal for creating a new conversation
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {Function} onSubmitSuccess - Function to call when a conversation is successfully created
 */
const NewConversationModal = ({ visible, onClose, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [encrypt, setEncrypt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch users and patients
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role')
        .eq('role', 'provider')
        .order('last_name');
        
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: visible
  });
  
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('last_name');
        
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: visible
  });
  
  // Create conversation mutation
  const createConversation = useCreateConversation();
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);
  
  const resetForm = () => {
    setRecipients([]);
    setMessageBody('');
    setTitle('');
    setCategory('general');
    setEncrypt(false);
    setSearchTerm('');
  };
  
  // Format users and patients for the Select component
  const getOptions = () => {
    const userOptions = users.map(u => ({
      label: `${u.first_name} ${u.last_name} (Provider)`,
      value: `provider_${u.id}`,
      type: 'provider'
    }));
    
    const patientOptions = patients.map(p => ({
      label: `${p.first_name} ${p.last_name} (Patient)`,
      value: `patient_${p.id}`,
      type: 'patient'
    }));
    
    return [...userOptions, ...patientOptions];
  };
  
  // Filter options based on search term
  const filteredOptions = getOptions().filter(option => 
    searchTerm ? option.label.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const handleRecipientChange = (value) => {
    setRecipients(value);
    
    // Auto-generate title if not set
    if (!title && value.length > 0) {
      const selectedRecipients = value.map(v => {
        const option = getOptions().find(opt => opt.value === v);
        return option ? option.label.split(' (')[0] : '';
      });
      
      setTitle(`Conversation with ${selectedRecipients.join(', ')}`);
    }
  };

  const handleSendMessage = () => {
    if (recipients.length === 0) {
      message.error('Please select at least one recipient.');
      return;
    }
    
    if (!messageBody.trim()) {
      message.error('Please enter a message.');
      return;
    }
    
    if (!title.trim()) {
      message.error('Please enter a conversation title.');
      return;
    }
    
    // Format participants for API
    const participants = recipients.map(recipient => {
      const [type, id] = recipient.split('_');
      return {
        userId: id,
        type
      };
    });
    
    // Add current user as a participant
    participants.push({
      userId: user.id,
      type: 'provider' // Assuming the current user is a provider
    });
    
    // Create the conversation
    createConversation.mutate({
      title: title.trim(),
      category,
      participants,
      initialMessage: messageBody.trim(),
      encrypt
    }, {
      onSuccess: () => {
        message.success('Conversation created successfully!');
        onSubmitSuccess();
        onClose();
      }
    });
  };

  return (
    <Modal
      title="New Conversation"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={createConversation.isLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createConversation.isLoading}
          onClick={handleSendMessage}
        >
          Create Conversation
        </Button>,
      ]}
      width={600}
    >
      {(isLoadingUsers || isLoadingPatients) ? (
        <div className="flex justify-center my-8">
          <Spin />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conversation Title
            </label>
            <Input
              placeholder="Enter conversation title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createConversation.isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Radio.Group 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              disabled={createConversation.isLoading}
            >
              <Radio.Button value="clinical">Clinical</Radio.Button>
              <Radio.Button value="billing">Billing</Radio.Button>
              <Radio.Button value="general">General</Radio.Button>
              <Radio.Button value="support">Support</Radio.Button>
            </Radio.Group>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients
            </label>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select recipients (Patients or Providers)"
              value={recipients}
              onChange={handleRecipientChange}
              options={filteredOptions}
              filterOption={false}
              onSearch={setSearchTerm}
              disabled={createConversation.isLoading}
              notFoundContent={searchTerm ? 'No recipients found' : 'Type to search'}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <TextArea
              rows={4}
              placeholder="Type your message here..."
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              disabled={createConversation.isLoading}
            />
          </div>
          
          {isEncryptionAvailable() && (
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="encrypt"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="mr-2"
                disabled={createConversation.isLoading}
              />
              <label htmlFor="encrypt" className="text-sm text-gray-700">
                Encrypt this message (end-to-end encryption)
              </label>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default NewConversationModal;

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Upload, List, Typography, Progress, message } from 'antd';
import { 
  InboxOutlined, 
  FileOutlined, 
  FilePdfOutlined, 
  FileImageOutlined, 
  FileExcelOutlined, 
  FileWordOutlined,
  DeleteOutlined,
  PaperClipOutlined
} from '@ant-design/icons';
import { supabase } from '../../../lib/supabase';

const { Dragger } = Upload;
const { Text, Title } = Typography;

/**
 * MessageAttachmentModal component
 * 
 * Modal for uploading and selecting file attachments for messages
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {Function} onClose - Function to call when the modal is closed
 * @param {Function} onSelect - Function to call when attachments are selected
 */
const MessageAttachmentModal = ({ visible, onClose, onSelect }) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  
  // Helper function to get the appropriate icon for a file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <FilePdfOutlined className="text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImageOutlined className="text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileExcelOutlined className="text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileWordOutlined className="text-indigo-500" />;
    } else {
      return <FileOutlined className="text-gray-500" />;
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select at least one file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Create a unique file path in the storage bucket
        const filePath = `message_attachments/${Date.now()}_${file.name}`;
        
        // Upload the file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('attachments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              // Update progress for this file
              setUploadProgress(prev => ({
                ...prev,
                [file.uid]: Math.round((progress.loaded / progress.total) * 100)
              }));
            }
          });
        
        if (error) {
          console.error('Error uploading file:', error);
          message.error(`Failed to upload ${file.name}`);
          continue;
        }
        
        // Get the public URL for the file
        const { data: urlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
        
        // Add the uploaded file to our result
        uploadedFiles.push({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          storagePath: filePath,
          url: urlData?.publicUrl
        });
      }
      
      // Call the onSelect callback with the uploaded files
      if (uploadedFiles.length > 0) {
        onSelect(uploadedFiles);
        message.success(`${uploadedFiles.length} file(s) uploaded successfully`);
        setFileList([]);
        onClose();
      }
    } catch (error) {
      console.error('Error in upload process:', error);
      message.error('An error occurred during upload');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };
  
  // Handle file selection
  const handleFileChange = ({ fileList }) => {
    // Limit to 5 files
    if (fileList.length > 5) {
      message.warning('You can only upload up to 5 files at once');
      return;
    }
    
    // Limit file size to 10MB
    const filteredFiles = fileList.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        message.error(`${file.name} exceeds the 10MB file size limit`);
        return false;
      }
      return true;
    });
    
    setFileList(filteredFiles);
  };
  
  // Handle file removal
  const handleRemoveFile = (file) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  return (
    <Modal
      title="Add Attachments"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={uploading}
          onClick={handleUpload}
          disabled={fileList.length === 0}
        >
          {uploading ? 'Uploading' : 'Add Selected Files'}
        </Button>
      ]}
      width={600}
    >
      <div className="mb-4">
        <Dragger
          multiple
          fileList={fileList}
          onChange={handleFileChange}
          onRemove={handleRemoveFile}
          beforeUpload={() => false} // Prevent auto upload
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-indigo-500" />
          </p>
          <p className="ant-upload-text">Click or drag files to this area to attach</p>
          <p className="ant-upload-hint text-xs text-gray-500">
            Support for single or bulk upload. Max 5 files, 10MB each.
          </p>
        </Dragger>
      </div>
      
      {fileList.length > 0 && (
        <div>
          <Title level={5} className="mb-2">Selected Files</Title>
          <List
            dataSource={fileList}
            renderItem={file => (
              <List.Item
                key={file.uid}
                actions={[
                  <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => handleRemoveFile(file)}
                    disabled={uploading}
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(file.type)}
                  title={file.name}
                  description={
                    <div>
                      <Text className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </Text>
                      {uploading && uploadProgress[file.uid] !== undefined && (
                        <Progress 
                          percent={uploadProgress[file.uid]} 
                          size="small" 
                          status="active" 
                          className="mt-1"
                        />
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Title level={5} className="mb-2">Tips for Secure File Sharing</Title>
        <ul className="text-xs text-gray-600 list-disc pl-4">
          <li>Do not upload files containing sensitive patient information unless necessary</li>
          <li>All uploaded files are encrypted at rest</li>
          <li>Files are only accessible to participants in this conversation</li>
          <li>Consider using password protection for highly sensitive documents</li>
        </ul>
      </div>
    </Modal>
  );
};

MessageAttachmentModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default MessageAttachmentModal;

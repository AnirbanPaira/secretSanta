import React, { useState } from 'react';
import { Upload, Table, Card, Button, Spin, Alert, Typography, Space } from 'antd';
import { UploadOutlined, GiftOutlined, DownloadOutlined } from '@ant-design/icons';
import Papa from 'papaparse';

const { Title } = Typography;

const SecretSantaApp = () => {
  const [secretSantaAssignments, setSecretSantaAssignments] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previousAssignments, setPreviousAssignments] = useState(null);

  const handlePreviousAssignments = (file) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setPreviousAssignments(results.data);
      },
      error: (err) => {
        setError('Failed to parse previous assignments CSV file');
      },
    });
  };

  const handleFileUpload = async (info) => {
    if (info.file.status !== 'uploading') {
      setLoading(true);
      setError(null);

      try {
        Papa.parse(info.file.originFileObj, {
          header: true,
          complete: async (results) => {
            try {
              const formData = new FormData();
              formData.append('csvFile', info.file.originFileObj);
              if (previousAssignments) {
                const previousAssignmentsBlob = new Blob(
                  [Papa.unparse(previousAssignments)],
                  { type: 'text/csv' }
                );
                formData.append('previousAssignments', previousAssignmentsBlob, 'previous.csv');
              }

              const response = await fetch('http://localhost:5001/api/secret_santa', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) {
                throw new Error('Failed to generate assignments');
              }

              const data = await response.json();
              setSecretSantaAssignments(data.assignments);
              info.file.status = 'done';
            } catch (err) {
              setError(err.message);
              info.file.status = 'error';
            } finally {
              setLoading(false);
            }
          },
          error: (err) => {
            setError('Failed to parse CSV file');
            setLoading(false);
            info.file.status = 'error';
          },
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
        info.file.status = 'error';
      }
    }
  };

  const downloadAssignments = () => {
    if (!secretSantaAssignments) return;

    const csv = Papa.unparse(secretSantaAssignments);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'secret_santa_assignments.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      title: 'Santa',
      key: 'santa',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.Employee_Name}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{record.Employee_EmailID}</div>
        </div>
      ),
    },
    {
      title: 'Gift Recipient',
      key: 'recipient',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.Secret_Child_Name}</div>
          <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{record.Secret_Child_EmailID}</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <GiftOutlined />
            Secret Santa Assignment Generator
          </Title>
        </div>

        <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
          <Upload
            accept=".csv"
            beforeUpload={(file) => {
              handlePreviousAssignments(file);
              return false;
            }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Upload Previous Year's Assignments (Optional)</Button>
          </Upload>

          <Upload.Dragger
            name="file"
            accept=".csv"
            customRequest={({ file, onSuccess }) => {
              handleFileUpload({ file: { originFileObj: file } });
              onSuccess();
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 32 }} />
            </p>
            <p className="ant-upload-text">Upload your CSV file with employee data</p>
            <p className="ant-upload-hint">
              File should include Employee_Name and Employee_EmailID columns
            </p>
          </Upload.Dragger>
        </Space>

        {previousAssignments && (
          <Alert
            message="Previous assignments loaded"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 8 }}>Generating assignments...</p>
          </div>
        )}

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {secretSantaAssignments && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>Secret Santa Assignments</Title>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadAssignments}
              >
                Download CSV
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={secretSantaAssignments}
              rowKey={(record) => record.Employee_EmailID}
              pagination={false}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SecretSantaApp;
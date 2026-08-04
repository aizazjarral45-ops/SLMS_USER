// import React, { useState } from 'react';
// import {
//   Row,
//   Col,
//   Card,
//   Statistic,
//   Descriptions,
//   Form,
//   Input,
//   Select,
//   Table,
//   Button,
//   Avatar,
//   Tag,
//   Badge,
//   Alert,
//   Tooltip,
//   Modal,
//   Drawer,
//   notification
// } from 'antd';
// import {
//   HomeOutlined,
//   NumberOutlined,
//   DollarCircleOutlined,
//   ToolOutlined,
//   PhoneOutlined,
//   MailOutlined,
//   RobotOutlined,
//   SendOutlined,
//   ExclamationCircleOutlined,
//   CheckCircleOutlined,
//   SyncOutlined,
//   InfoCircleOutlined,
//   BookOutlined,
//   ReloadOutlined
// } from '@ant-design/icons';
// import './Hostel.css';

// const { Option } = Select;
// const { TextArea } = Input;

// export default function Hostel() {
//   const [maintenanceForm] = Form.useForm();
  
//   // State for Payment History Modal
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

//   // State for AI Assistant Drawer / Interactive Chat
//   const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([
//     { sender: 'ai', text: 'Hello! I am your AI Hostel Copilot. How can I help you today?' }
//   ]);
//   const [chatInput, setChatInput] = useState('');

//   // Maintenance Table State
//   const [maintenanceHistory, setMaintenanceHistory] = useState([
//     {
//       key: '1',
//       title: 'AC Cooling Issue',
//       category: 'Electricity',
//       date: '2026-07-28',
//       status: 'In Progress'
//     },
//     {
//       key: '2',
//       title: 'Bathroom Tap Leakage',
//       category: 'Water',
//       date: '2026-07-15',
//       status: 'Resolved'
//     },
//     {
//       key: '3',
//       title: 'Study Desk Drawer Lock Broken',
//       category: 'Furniture',
//       date: '2026-06-10',
//       status: 'Resolved'
//     }
//   ]);

//   // Handle Maintenance Form Submission
//   const handleMaintenanceSubmit = (values) => {
//     const newRequest = {
//       key: String(Date.now()),
//       title: values.title,
//       category: values.category,
//       date: new Date().toISOString().split('T')[0],
//       status: 'Pending'
//     };
//     setMaintenanceHistory([newRequest, ...maintenanceHistory]);
//     notification.success({
//       message: 'Maintenance Request Submitted',
//       description: `Your request for "${values.title}" has been registered successfully.`
//     });
//     maintenanceForm.resetFields();
//   };

//   // Handle AI Copilot Interaction
//   const handleSendMessage = (textToSend) => {
//     const query = textToSend || chatInput;
//     if (!query.trim()) return;

//     const updatedMessages = [...chatMessages, { sender: 'user', text: query }];
//     setChatMessages(updatedMessages);
//     if (!textToSend) setChatInput('');

//     setTimeout(() => {
//       let responseText = "I've logged your query. Please check your dashboard or reach out to your warden for further details.";
//       const lower = query.toLowerCase();

//       if (lower.includes('fee')) {
//         responseText = 'Your remaining hostel fee of $450 is due on September 15, 2026.';
//       } else if (lower.includes('maintenance') || lower.includes('report')) {
//         responseText = 'You can log a maintenance issue directly in Section 4 using the form on this page.';
//       } else if (lower.includes('warden')) {
//         responseText = 'Your Hostel Warden is Dr. Robert Vance. Contact: +1 (555) 019-2834 | Email: r.vance@university.edu.';
//       } else if (lower.includes('rule')) {
//         responseText = 'Hostel Curfew is 10:00 PM. Visiting hours are 4:00 PM - 7:00 PM. Quiet hours start at 11:00 PM.';
//       }

//       setChatMessages((prev) => [...prev, { sender: 'ai', text: responseText }]);
//     }, 500);
//   };

//   // Helper for quick page smooth scrolling
//   const scrollToSection = (id) => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   // Maintenance Table Columns
//   const columns = [
//     {
//       title: 'Request Title',
//       dataIndex: 'title',
//       key: 'title',
//       render: (text) => <strong>{text}</strong>
//     },
//     {
//       title: 'Category',
//       dataIndex: 'category',
//       key: 'category',
//       render: (cat) => <Tag color="blue">{cat}</Tag>
//     },
//     {
//       title: 'Date',
//       dataIndex: 'date',
//       key: 'date'
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status) => {
//         let color = 'gold';
//         let icon = <SyncOutlined spin />;
//         if (status === 'Resolved') {
//           color = 'green';
//           icon = <CheckCircleOutlined />;
//         } else if (status === 'Pending') {
//           color = 'volcano';
//           icon = <ExclamationCircleOutlined />;
//         }
//         return <Tag color={color} icon={icon}>{status}</Tag>;
//       }
//     }
//   ];

//   // Emergency Contacts Mock Data
//   const emergencyContacts = [
//     {
//       role: 'Hostel Warden',
//       name: 'Dr. Robert Vance',
//       phone: '+1 (555) 019-2834',
//       email: 'r.vance@university.edu',
//       avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
//     },
//     {
//       role: 'Security Office',
//       name: 'Campus Security Control',
//       phone: '+1 (555) 911-0022',
//       email: 'security@university.edu',
//       avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80'
//     },
//     {
//       role: 'Medical Centre',
//       name: 'University Clinic Desk',
//       phone: '+1 (555) 911-0033',
//       email: 'health@university.edu',
//       avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80'
//     }
//   ];

//   return (
//     <div className="hostel-page-container">
      
//       {/* PAGE HEADER */}
//       <div className="hostel-page-header glassmorphism-card">
//         <div>
//           <h1 className="hostel-page-title">Hostel Management</h1>
//           <p className="hostel-page-subtitle">
//             Manage your hostel information and essential hostel services.
//           </p>
//         </div>
//       </div>

//       {/* SECTION 8 – QUICK ACTIONS */}
//       <div className="hostel-section">
//         <Row gutter={[16, 16]}>
//           <Col xs={12} sm={6}>
//             <Card hoverable className="quick-action-card" onClick={() => scrollToSection('maintenance-section')}>
//               <ToolOutlined className="quick-action-icon text-blue" />
//               <span className="quick-action-text">Report Maintenance</span>
//             </Card>
//           </Col>
//           <Col xs={12} sm={6}>
//             <Card hoverable className="quick-action-card" onClick={() => scrollToSection('fee-section')}>
//               <DollarCircleOutlined className="quick-action-icon text-green" />
//               <span className="quick-action-text">View Hostel Fee</span>
//             </Card>
//           </Col>
//           <Col xs={12} sm={6}>
//             <Card hoverable className="quick-action-card" onClick={() => scrollToSection('contacts-section')}>
//               <PhoneOutlined className="quick-action-icon text-purple" />
//               <span className="quick-action-text">Contact Warden</span>
//             </Card>
//           </Col>
//           <Col xs={12} sm={6}>
//             <Card hoverable className="quick-action-card" onClick={() => setIsAiDrawerOpen(true)}>
//               <RobotOutlined className="quick-action-icon text-orange" />
//               <span className="quick-action-text">Open AI Copilot</span>
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       {/* SECTION 1 – HOSTEL OVERVIEW */}
//       <div className="hostel-section">
//         <Row gutter={[16, 16]}>
//           <Col xs={24} sm={12} lg={6}>
//             <Card className="stat-card glassmorphism-card" bordered={false}>
//               <Statistic
//                 title="Hostel Name"
//                 value="Falcon Hall"
//                 prefix={<HomeOutlined className="stat-icon" />}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} lg={6}>
//             <Card className="stat-card glassmorphism-card" bordered={false}>
//               <Statistic
//                 title="Room Number"
//                 value="B-304"
//                 prefix={<NumberOutlined className="stat-icon" />}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} lg={6}>
//             <Card className="stat-card glassmorphism-card" bordered={false}>
//               <Statistic
//                 title="Hostel Fee Status"
//                 value="Partial Paid"
//                 valueStyle={{ color: '#fa8c16' }}
//                 prefix={<DollarCircleOutlined className="stat-icon" />}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} lg={6}>
//             <Card className="stat-card glassmorphism-card" bordered={false}>
//               <Statistic
//                 title="Maintenance Requests"
//                 value="1 Active"
//                 valueStyle={{ color: '#1890ff' }}
//                 prefix={<ToolOutlined className="stat-icon" />}
//               />
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       {/* SECTION 2 – MY ROOM */}
//       <div className="hostel-section">
//         <Card title="My Room Information" className="glassmorphism-card">
//           <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="middle">
//             <Descriptions.Item label="Hostel Name">Falcon Hall</Descriptions.Item>
//             <Descriptions.Item label="Block">Block A</Descriptions.Item>
//             <Descriptions.Item label="Floor">3rd Floor</Descriptions.Item>
//             <Descriptions.Item label="Room Number">B-304</Descriptions.Item>
//             <Descriptions.Item label="Room Type">Double Sharing (AC)</Descriptions.Item>
//             <Descriptions.Item label="Roommate Name">Alex Mercer</Descriptions.Item>
//             <Descriptions.Item label="Warden Name" span={3}>
//               Dr. Robert Vance (+1 555-019-2834)
//             </Descriptions.Item>
//           </Descriptions>
//         </Card>
//       </div>

//       {/* SECTION 3 – HOSTEL FEE */}
//       <div className="hostel-section" id="fee-section">
//         <Card title="Hostel Fee Summary" className="glassmorphism-card">
//           <Row gutter={[24, 24]} align="middle">
//             <Col xs={24} md={16}>
//               <Row gutter={[16, 16]}>
//                 <Col xs={12} sm={6}>
//                   <Statistic title="Total Hostel Fee" value={1800} prefix="$" />
//                 </Col>
//                 <Col xs={12} sm={6}>
//                   <Statistic title="Paid Amount" value={1350} prefix="$" valueStyle={{ color: '#3f8600' }} />
//                 </Col>
//                 <Col xs={12} sm={6}>
//                   <Statistic title="Remaining Amount" value={450} prefix="$" valueStyle={{ color: '#cf1322' }} />
//                 </Col>
//                 <Col xs={12} sm={6}>
//                   <Statistic title="Due Date" value="Sep 15, 2026" />
//                 </Col>
//               </Row>
//             </Col>
//             <Col xs={24} md={8} className="fee-actions-column">
//               <Button
//                 type="primary"
//                 block
//                 icon={<DollarCircleOutlined />}
//                 onClick={() => setIsPaymentModalOpen(true)}
//               >
//                 View Payment History
//               </Button>
//             </Col>
//           </Row>
//         </Card>
//       </div>

//       {/* SECTION 4 – MAINTENANCE REQUEST */}
//       <div className="hostel-section" id="maintenance-section">
//         <Row gutter={[24, 24]}>
//           <Col xs={24} lg={10}>
//             <Card title="Submit Maintenance Request" className="glassmorphism-card">
//               <Form form={maintenanceForm} layout="vertical" onFinish={handleMaintenanceSubmit}>
//                 <Form.Item
//                   name="title"
//                   label="Issue Title"
//                   rules={[{ required: true, message: 'Please enter an issue title' }]}
//                 >
//                   <Input placeholder="e.g. Water heater not working" />
//                 </Form.Item>
//                 <Form.Item
//                   name="category"
//                   label="Issue Category"
//                   rules={[{ required: true, message: 'Please select a category' }]}
//                 >
//                   <Select placeholder="Select category">
//                     <Option value="Electricity">Electricity</Option>
//                     <Option value="Water">Water</Option>
//                     <Option value="Internet">Internet</Option>
//                     <Option value="Furniture">Furniture</Option>
//                     <Option value="Cleaning">Cleaning</Option>
//                     <Option value="Other">Other</Option>
//                   </Select>
//                 </Form.Item>
//                 <Form.Item
//                   name="description"
//                   label="Description"
//                   rules={[{ required: true, message: 'Please describe the issue' }]}
//                 >
//                   <TextArea rows={3} placeholder="Provide details regarding the issue..." />
//                 </Form.Item>
//                 <div className="form-btn-group">
//                   <Button type="primary" htmlType="submit">Submit Request</Button>
//                   <Button icon={<ReloadOutlined />} onClick={() => maintenanceForm.resetFields()}>Reset</Button>
//                 </div>
//               </Form>
//             </Card>
//           </Col>

//           <Col xs={24} lg={14}>
//             <Card title="Maintenance Request Table" className="glassmorphism-card full-height-card">
//               <Table
//                 dataSource={maintenanceHistory}
//                 columns={columns}
//                 pagination={{ pageSize: 4 }}
//                 scroll={{ x: 450 }}
//               />
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       {/* SECTION 5 – HOSTEL NOTICES */}
//       <div className="hostel-section">
//         <Card title="Hostel Notices & Announcements" className="glassmorphism-card">
//           <Row gutter={[16, 16]}>
//             <Col xs={24} md={8}>
//               <Alert
//                 message="Water Supply Maintenance"
//                 description="Routine cleaning of overhead tanks scheduled on August 5 from 10:00 AM to 1:00 PM. Kindly store water in advance."
//                 type="warning"
//                 showIcon
//                 className="notice-alert-card"
//               />
//             </Col>
//             <Col xs={24} md={8}>
//               <Alert
//                 message="Hostel Inspection"
//                 description="General hostel cleanliness and safety equipment inspection by warden staff on August 10, 2026."
//                 type="info"
//                 showIcon
//                 className="notice-alert-card"
//               />
//             </Col>
//             <Col xs={24} md={8}>
//               <Alert
//                 message="Holiday Notice"
//                 description="Hostel dining hours modified for the upcoming long weekend. Special dinner menu will be served on Sunday."
//                 type="success"
//                 showIcon
//                 className="notice-alert-card"
//               />
//             </Col>
//           </Row>
//         </Card>
//       </div>

//       {/* SECTION 6 – EMERGENCY CONTACTS */}
//       <div className="hostel-section" id="contacts-section">
//         <h3 className="section-heading">Emergency Contacts</h3>
//         <Row gutter={[16, 16]}>
//           {emergencyContacts.map((contact, idx) => (
//             <Col xs={24} sm={8} key={idx}>
//               <Card className="glassmorphism-card contact-card" bordered={false}>
//                 <Avatar src={contact.avatar} size={60} className="contact-avatar" />
//                 <h4 className="contact-role">{contact.role}</h4>
//                 <p className="contact-name">{contact.name}</p>
//                 <div className="contact-info">
//                   <div><PhoneOutlined /> {contact.phone}</div>
//                   <div><MailOutlined /> {contact.email}</div>
//                 </div>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </div>

//       {/* SECTION 7 – AI HOSTEL COPILOT */}
//       <div className="hostel-section">
//         <Card className="glassmorphism-card ai-copilot-card">
//           <div className="ai-card-header">
//             <div className="ai-header-title">
//               <RobotOutlined className="ai-title-icon" />
//               <div>
//                 <h2>AI Hostel Copilot</h2>
//                 <p>Your instant assistant for hostel queries and support.</p>
//               </div>
//             </div>
//             <div className="ai-header-buttons">
//               <Button type="primary" size="small" icon={<RobotOutlined />} onClick={() => setIsAiDrawerOpen(true)}>
//                 Ask AI
//               </Button>
//               <Button size="small" icon={<BookOutlined />} onClick={() => notification.info({ message: 'Hostel Guidebook downloaded.' })}>
//                 Hostel Guide
//               </Button>
//             </div>
//           </div>

//           <div className="suggested-questions">
//             <span className="suggested-label">Suggested Questions:</span>
//             <div className="suggested-chips">
//               <Tag className="chip-btn" onClick={() => handleSendMessage('When is my hostel fee due?')}>When is my hostel fee due?</Tag>
//               <Tag className="chip-btn" onClick={() => handleSendMessage('How do I report a maintenance issue?')}>How do I report a maintenance issue?</Tag>
//               <Tag className="chip-btn" onClick={() => handleSendMessage('Who is my hostel warden?')}>Who is my hostel warden?</Tag>
//               <Tag className="chip-btn" onClick={() => handleSendMessage('Show hostel rules.')}>Show hostel rules</Tag>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* PAYMENT HISTORY MODAL */}
//       <Modal
//         title="Hostel Fee Payment History"
//         open={isPaymentModalOpen}
//         onCancel={() => setIsPaymentModalOpen(false)}
//         footer={[<Button key="close" type="primary" onClick={() => setIsPaymentModalOpen(false)}>Close</Button>]}
//       >
//         <Table
//           dataSource={[
//             { key: '1', date: '2026-01-10', desc: 'Semester 1 Fee', amount: '$900', status: 'Paid' },
//             { key: '2', date: '2026-05-15', desc: 'Installment 1', amount: '$450', status: 'Paid' },
//             { key: '3', date: '2026-09-15', desc: 'Installment 2', amount: '$450', status: 'Pending' }
//           ]}
//           columns={[
//             { title: 'Date', dataIndex: 'date', key: 'date' },
//             { title: 'Description', dataIndex: 'desc', key: 'desc' },
//             { title: 'Amount', dataIndex: 'amount', key: 'amount' },
//             {
//               title: 'Status',
//               dataIndex: 'status',
//               key: 'status',
//               render: (st) => <Tag color={st === 'Paid' ? 'green' : 'volcano'}>{st}</Tag>
//             }
//           ]}
//           pagination={false}
//           size="small"
//         />
//       </Modal>

//       {/* AI COPILOT INTERACTIVE DRAWER */}
//       <Drawer
//         title="AI Hostel Copilot"
//         placement="right"
//         width={380}
//         onClose={() => setIsAiDrawerOpen(false)}
//         open={isAiDrawerOpen}
//       >
//         <div className="ai-drawer-container">
//           <div className="ai-messages-list">
//             {chatMessages.map((msg, index) => (
//               <div key={index} className={`chat-bubble-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}>
//                 <div className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
//                   {msg.text}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="ai-input-bar">
//             <Input
//               placeholder="Ask a question..."
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//               onPressEnter={() => handleSendMessage()}
//             />
//             <Button type="primary" icon={<SendOutlined />} onClick={() => handleSendMessage()} />
//           </div>
//         </div>
//       </Drawer>

//     </div>
//   );
// }
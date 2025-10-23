const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    }
  });
};

const sendTeacherAbsenceNotification = async (teacherEmail, teacherName, classDetails, studentName, graceTimeExpiry) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: teacherEmail,
      subject: '🚨 Class Engagement Alert - Student Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Class Engagement Alert</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${teacherName}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              A student has reported that you were absent for the following class:
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Class Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${classDetails.subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${classDetails.startTime} - ${classDetails.endTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Room:</strong> ${classDetails.room || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Reported by:</strong> ${studentName}</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">⏰ Action Required</h3>
              <p style="margin: 0; color: #856404; font-size: 14px;">
                Please respond to this notification before <strong>${new Date(graceTimeExpiry).toLocaleString()}</strong> to confirm or deny this absence report.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                If you were present for this class, please log into the system immediately to update the class status.
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px;">
                Login to System
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated notification from the Class Engagement System. 
                If you believe this is an error, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Absence notification sent to ${teacherEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending teacher absence notification:', error);
    return false;
  }
};

// Send class status update notification to students
const sendClassStatusUpdateNotification = async (studentEmails, classDetails, status, teacherName) => {
  try {
    const transporter = createTransporter();

    let statusMessage = '';
    let statusColor = '';
    let statusIcon = '';

    switch (status) {
      case 'not_taking':
        statusMessage = 'Class has been cancelled';
        statusColor = '#dc3545';
        statusIcon = '❌';
        break;
      case 'delayed':
        statusMessage = `Class has been delayed by ${classDetails.delayMinutes} minutes`;
        statusColor = '#fd7e14';
        statusIcon = '⏰';
        break;
      case 'engaged':
        statusMessage = 'Class is proceeding as scheduled';
        statusColor = '#28a745';
        statusIcon = '✅';
        break;
      case 'absent':
        statusMessage = 'Teacher has been marked absent';
        statusColor = '#6c757d';
        statusIcon = '⚠️';
        break;
      case 'manual_substitute':
        statusMessage = 'You have been assigned as substitute teacher';
        statusColor = '#007bff';
        statusIcon = '👨‍🏫';
        break;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmails, // Send to single recipient for substitute notifications
      subject: `${statusIcon} Class Assignment - ${classDetails.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${statusIcon} Class Assignment Notification</h1>
          </div>

          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Class Information:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${classDetails.subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Section:</strong> ${classDetails.classId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${classDetails.startTime} - ${classDetails.endTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Room:</strong> ${classDetails.room || 'N/A'}</p>
            </div>

            <div style="background: ${statusColor}15; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; color: ${statusColor}; font-size: 18px;">${statusMessage}</h2>
            </div>

            ${classDetails.assignmentType === 'manual_substitute' ? `
              <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #155724;">Assignment Details:</h4>
                <p style="margin: 0; color: #155724;">You have been manually assigned as a substitute teacher for this class. Please prepare accordingly.</p>
              </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Please log into the system to view more details and update class status if needed.
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
                 style="display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px;">
                Access System
              </a>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated notification from the Class Engagement System.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Class assignment notification sent to ${studentEmails}`);
    return true;
  } catch (error) {
    console.error('Error sending class assignment notification:', error);
    return false;
  }
};

// Send class status update notification to students (original function)
const sendClassStatusUpdateNotificationToStudents = async (studentEmails, classDetails, status, teacherName) => {
  try {
    const transporter = createTransporter();
    
    let statusMessage = '';
    let statusColor = '';
    let statusIcon = '';
    
    switch (status) {
      case 'not_taking':
        statusMessage = 'Class has been cancelled';
        statusColor = '#dc3545';
        statusIcon = '❌';
        break;
      case 'delayed':
        statusMessage = `Class has been delayed by ${classDetails.delayMinutes} minutes`;
        statusColor = '#fd7e14';
        statusIcon = '⏰';
        break;
      case 'engaged':
        statusMessage = 'Class is proceeding as scheduled';
        statusColor = '#28a745';
        statusIcon = '✅';
        break;
      case 'absent':
        statusMessage = 'Teacher has been marked absent';
        statusColor = '#6c757d';
        statusIcon = '⚠️';
        break;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: studentEmails, // Send to multiple students
      subject: `${statusIcon} Class Update - ${classDetails.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">${statusIcon} Class Status Update</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Class Information:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${classDetails.subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Teacher:</strong> ${teacherName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${classDetails.startTime} - ${classDetails.endTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Room:</strong> ${classDetails.room || 'N/A'}</p>
            </div>
            
            <div style="background: ${statusColor}15; padding: 15px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0; text-align: center;">
              <h2 style="margin: 0; color: ${statusColor}; font-size: 18px;">${statusMessage}</h2>
            </div>
            
            ${classDetails.remarks ? `
              <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">Additional Notes:</h4>
                <p style="margin: 0; color: #6c757d;">${classDetails.remarks}</p>
              </div>
            ` : ''}
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated notification from the Class Engagement System.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Class status update sent to ${studentEmails.length} students`);
    return true;
  } catch (error) {
    console.error('Error sending class status update notification:', error);
    return false;
  }
};

// Send query response notification
const sendQueryResponseNotification = async (studentEmail, studentName, queryDetails, adminResponse) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: '📋 Query Response - Class Engagement System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">📋 Query Response</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${studentName}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Your query has been reviewed and responded to by the administration.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #6f42c1; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Your Query:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${queryDetails.category}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Message:</strong> ${queryDetails.message}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(queryDetails.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #0c5460;">Admin Response:</h3>
              <p style="margin: 0; color: #0c5460;">${adminResponse}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                If you have any further questions, please feel free to submit another query through the system.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Query response sent to ${studentEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending query response notification:', error);
    return false;
  }
};

const sendReminderEmail = async (teacherEmail, teacherName, reminder) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: teacherEmail,
      subject: `🔔 Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Gentle Reminder</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${teacherName}</strong>,</p>
            
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              This is a reminder for your upcoming task:
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Reminder Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Title:</strong> ${reminder.title}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Description:</strong> ${reminder.description || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(reminder.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${reminder.time}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Please ensure you complete this task as scheduled.
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
                 style="display: inline-block; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px;">
                View Reminders
              </a>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated reminder from the Class Engagement System.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${teacherEmail} for reminder: ${reminder.title}`);
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

// Send substitute request notification to available teachers
const sendSubstituteRequestNotification = async (teacherEmails, originalTeacherName, classDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: teacherEmails, // Send to multiple teachers(blind carbon copy)
      subject: '🤝 Substitute Teaching Opportunity Available',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🤝 Substitute Teaching Opportunity</h1>
          </div>

          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear Teacher,</p>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              A colleague needs a substitute teacher for the following class. If you're available, please consider taking this opportunity.
            </p>

            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Class Details:</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Original Teacher:</strong> ${originalTeacherName}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${classDetails.subject}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Section:</strong> ${classDetails.classId}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> ${new Date(classDetails.date).toLocaleDateString()}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${classDetails.startTime} - ${classDetails.endTime}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Room:</strong> ${classDetails.room || 'N/A'}</p>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">⏰ Action Required</h3>
              <p style="margin: 0; color: #856404; font-size: 14px;">
                Please log into the system to view and accept this substitute request. This opportunity will be available for a limited time.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Help keep classes running smoothly by stepping in when needed.
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
                 style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-top: 10px;">
                View Substitute Requests
              </a>
            </div>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated notification from the Class Engagement System.
                If you have any questions, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Substitute request notification sent to ${teacherEmails.length} teachers`);
    return true;
  } catch (error) {
    console.error('Error sending substitute request notification:', error);
    return false;
  }
};

module.exports = {
  sendTeacherAbsenceNotification,
  sendClassStatusUpdateNotification,
  sendClassStatusUpdateNotificationToStudents,
  sendQueryResponseNotification,
  sendReminderEmail,
  sendSubstituteRequestNotification
};
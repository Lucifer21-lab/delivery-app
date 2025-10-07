const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: `"Delivery App" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

exports.sendWelcomeEmail = async (user) => {
    const subject = 'Welcome to Delivery App';
    const html = `
    <h1>Welcome ${user.name}!</h1>
    <p>Thank you for registering with Delivery App.</p>
    <p>You can now create delivery requests or accept deliveries from others.</p>
    <p>Best regards,<br>Delivery App Team</p>
  `;

    await this.sendEmail(user.email, subject, html);
};

exports.sendDeliveryAcceptedEmail = async (requester, deliveryPerson, delivery) => {
    const subject = 'Your Delivery Request Was Accepted';
    const html = `
    <h1>Great News!</h1>
    <p>Hi ${requester.name},</p>
    <p>${deliveryPerson.name} has accepted your delivery request: "${delivery.title}"</p>
    <p><strong>Delivery Details:</strong></p>
    <ul>
      <li>From: ${delivery.pickupLocation.address}</li>
      <li>To: ${delivery.deliveryLocation.address}</li>
      <li>Deadline: ${new Date(delivery.deliveryDeadline).toLocaleString()}</li>
    </ul>
    <p>You can track your delivery in the app.</p>
    <p>Best regards,<br>Delivery App Team</p>
  `;

    await this.sendEmail(requester.email, subject, html);
};

exports.sendDeliveryCompletedEmail = async (requester, delivery) => {
    const subject = 'Your Delivery Was Completed';
    const html = `
    <h1>Delivery Completed!</h1>
    <p>Hi ${requester.name},</p>
    <p>Your delivery "${delivery.title}" has been successfully completed.</p>
    <p>Thank you for using Delivery App!</p>
    <p>Best regards,<br>Delivery App Team</p>
  `;

    await this.sendEmail(requester.email, subject, html);
};

exports.sendPasswordResetEmail = async (email, name, resetUrl) => {
    const subject = 'Password Reset Request';
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .warning {
          background-color: #FEF3C7;
          border-left: 4px solid #F59E0B;
          padding: 10px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your Delivery App account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Your password will not change unless you click the link above</li>
            </ul>
          </div>
          <p>Best regards,<br>Delivery App Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} Delivery App. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    await this.sendEmail(email, subject, html);
};

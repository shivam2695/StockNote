const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"StockNote" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - StockNote',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">StockNote</h1>
            <p style="color: white; margin: 5px 0;">Trading Journal</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up for StockNote! To complete your registration, please use the verification code below:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 8px; margin: 0;">${token}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code will expire in 10 minutes. If you didn't create an account with StockNote, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"StockNote" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - StockNote',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">StockNote</h1>
            <p style="color: white; margin: 5px 0;">Trading Journal</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            
            <p style="color: #666; line-height: 1.6;">
              We received a request to reset your password. Use the code below to reset your password:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 8px; margin: 0;">${token}</h1>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
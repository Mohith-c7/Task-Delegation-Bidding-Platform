package utils

import "fmt"

// GetOTPEmailTemplate returns HTML template for OTP emails
func GetOTPEmailTemplate(recipientName, otp, purpose string) string {
	var title, message string
	
	switch purpose {
	case "email_verification":
		title = "Verify Your Email"
		message = "Welcome to TaskHub! Please use the following code to verify your email address:"
	case "login":
		title = "Login Verification"
		message = "Someone is trying to login to your account. Use this code to complete the login:"
	case "password_reset":
		title = "Reset Your Password"
		message = "You requested to reset your password. Use this code to proceed:"
	default:
		title = "Verification Code"
		message = "Your verification code:"
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TaskHub</h1>
            <p>%s</p>
        </div>
        <div class="content">
            <p>Hi %s,</p>
            <p>%s</p>
            <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">%s</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 5 minutes</p>
            </div>
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. TaskHub will never ask for your code.
            </div>
            <p>If you didn't request this code, please ignore this email or contact support if you're concerned.</p>
        </div>
        <div class="footer">
            <p>This is an automated email from TaskHub. Please do not reply.</p>
            <p>&copy; 2026 TaskHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, title, recipientName, message, otp)
}

// GetWelcomeEmailTemplate returns HTML template for welcome emails
func GetWelcomeEmailTemplate(recipientName string) string {
	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 40px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to TaskHub!</h1>
        </div>
        <div class="content">
            <p>Hi %s,</p>
            <p>Welcome to TaskHub - your collaborative task delegation platform!</p>
            <p>You can now:</p>
            <ul>
                <li>📝 Post tasks when you need help</li>
                <li>💰 Bid on tasks to help your colleagues</li>
                <li>🤝 Collaborate with your team</li>
                <li>📊 Track task progress</li>
            </ul>
            <p style="text-align: center;">
                <a href="http://localhost:5173/dashboard" class="button">Go to Dashboard</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 TaskHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, recipientName)
}

// GetNotificationEmailTemplate returns HTML template for notifications
func GetNotificationEmailTemplate(recipientName, title, message, actionURL, actionText string) string {
	actionButton := ""
	if actionURL != "" && actionText != "" {
		actionButton = fmt.Sprintf(`<p style="text-align: center;"><a href="%s" class="button">%s</a></p>`, actionURL, actionText)
	}

	return fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔔 %s</h2>
        </div>
        <div class="content">
            <p>Hi %s,</p>
            <p>%s</p>
            %s
        </div>
        <div class="footer">
            <p>&copy; 2026 TaskHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, title, recipientName, message, actionButton)
}

using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl);
        Task SendWelcomeEmailAsync(string email, string firstName);
        Task SendEmailConfirmationAsync(string email, string confirmationToken, string confirmationUrl);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;

        public EmailService(IOptions<EmailSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken, string resetUrl)
        {
            var subject = "Password Reset - EventSmart Pro";
            var body = $@"
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Click the link below to reset your password:</p>
                <p><a href=""{resetUrl}?token={resetToken}"" style=""background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;"">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <br>
                <p>Best regards,<br>EventSmart Pro Team</p>
            ";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendWelcomeEmailAsync(string email, string firstName)
        {
            var subject = "Welcome to EventSmart Pro!";
            var body = $@"
                <h2>Welcome to EventSmart Pro, {firstName}!</h2>
                <p>Thank you for joining EventSmart Pro. Your account has been successfully created.</p>
                <p>You can now start exploring our platform and manage your events efficiently.</p>
                <br>
                <p>Best regards,<br>EventSmart Pro Team</p>
            ";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendEmailConfirmationAsync(string email, string confirmationToken, string confirmationUrl)
        {
            var subject = "Confirm Your Email - EventSmart Pro";
            var body = $@"
                <h2>Confirm Your Email Address</h2>
                <p>Please confirm your email address by clicking the link below:</p>
                <p><a href=""{confirmationUrl}?token={confirmationToken}"" style=""background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;"">Confirm Email</a></p>
                <p>This link will expire in 24 hours.</p>
                <br>
                <p>Best regards,<br>EventSmart Pro Team</p>
            ";

            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_emailSettings.FromName, _emailSettings.FromEmail));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.Port, SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                // Log the exception (implement proper logging)
                throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
            }
        }
    }

    public class EmailSettings
    {
        public string SmtpServer { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string FromName { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

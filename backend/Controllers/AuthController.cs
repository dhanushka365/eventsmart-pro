using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ITokenService tokenService,
            IEmailService emailService,
            IGoogleAuthService googleAuthService,
            ApplicationDbContext context,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _googleAuthService = googleAuthService;
            _context = context;
            _logger = logger;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            try
            {
                return Ok(new { 
                    message = "Auth controller is working", 
                    timestamp = DateTime.UtcNow,
                    environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Test failed", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            try
            {
                _logger.LogInformation("Registration attempt for email: {Email}", model.Email);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for registration: {Errors}", 
                        string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                    return BadRequest(ModelState);
                }

                // Test database connection first
                try
                {
                    var canConnect = await _context.Database.CanConnectAsync();
                    if (!canConnect)
                    {
                        _logger.LogError("Cannot connect to database during registration");
                        return StatusCode(500, new { message = "Database connection failed" });
                    }
                }
                catch (Exception dbEx)
                {
                    _logger.LogError(dbEx, "Database connection test failed during registration");
                    return StatusCode(500, new { message = "Database connection error", error = dbEx.Message });
                }

                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                {
                    _logger.LogWarning("Registration attempt with existing email: {Email}", model.Email);
                    return BadRequest(new { message = "User with this email already exists" });
                }

                var user = new User
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    Role = model.Role,
                    EmailConfirmed = true // For demo purposes, in production you'd send confirmation email
                };

                _logger.LogInformation("Creating user with UserManager for email: {Email}", model.Email);
                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    _logger.LogError("Failed to create user: {Errors}", 
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                    return BadRequest(new { message = "Failed to create user", errors = result.Errors });
                }

                _logger.LogInformation("User created successfully, logging login attempt");
                await LogLoginAttempt(user.Id, true, null);

                // Send welcome email (optional, don't fail registration if this fails)
                try
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
                    _logger.LogInformation("Welcome email sent successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to send welcome email to {Email}", user.Email);
                    // Don't fail registration because of email issues
                }

                _logger.LogInformation("Generating tokens for user: {Email}", user.Email);
                var tokens = _tokenService.GenerateTokens(user);
                
                // Save refresh token
                user.RefreshToken = tokens.RefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                _logger.LogInformation("Registration completed successfully for user: {Email}", user.Email);
                return Ok(tokens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Registration error for email: {Email}. Error: {Message}", 
                    model?.Email ?? "unknown", ex.Message);
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    await LogLoginAttempt("", false, "User not found");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                if (!user.IsActive)
                {
                    await LogLoginAttempt(user.Id, false, "Account deactivated");
                    return Unauthorized(new { message = "Account is deactivated" });
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                if (!result.Succeeded)
                {
                    await LogLoginAttempt(user.Id, false, "Invalid password");
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                await LogLoginAttempt(user.Id, true, null);

                var tokens = _tokenService.GenerateTokens(user);
                
                // Save refresh token and update last login date
                user.RefreshToken = tokens.RefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                user.LastLoginDate = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                return Ok(tokens);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("google-auth")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDto model)
        {
            try
            {
                var payload = await _googleAuthService.ValidateGoogleTokenAsync(model.GoogleToken);
                
                var user = await _userManager.FindByEmailAsync(payload.Email);
                
                if (user == null)
                {
                    // Create new user from Google account
                    user = new User
                    {
                        UserName = payload.Email,
                        Email = payload.Email,
                        FirstName = payload.GivenName ?? "",
                        LastName = payload.FamilyName ?? "",
                        EmailConfirmed = true,
                        GoogleId = payload.Subject,
                        IsGoogleAuth = true,
                        Role = UserRole.Attendee // Default role for Google users
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return BadRequest(new { message = "Failed to create user", errors = result.Errors });

                    // Send welcome email
                    try
                    {
                        await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Failed to send welcome email: {ex.Message}");
                    }
                }
                else if (!user.IsGoogleAuth)
                {
                    // Link existing account with Google
                    user.GoogleId = payload.Subject;
                    user.IsGoogleAuth = true;
                    await _userManager.UpdateAsync(user);
                }

                if (!user.IsActive)
                {
                    await LogLoginAttempt(user.Id, false, "Account deactivated");
                    return Unauthorized(new { message = "Account is deactivated" });
                }

                await LogLoginAttempt(user.Id, true, null);

                var tokens = _tokenService.GenerateTokens(user);
                
                // Save refresh token
                user.RefreshToken = tokens.RefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                return Ok(tokens);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Google auth error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto model)
        {
            try
            {
                var principal = _tokenService.GetPrincipalFromExpiredToken(model.Token);
                var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Invalid token" });

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null || !_tokenService.ValidateRefreshToken(user, model.RefreshToken))
                    return Unauthorized(new { message = "Invalid refresh token" });

                var tokens = _tokenService.GenerateTokens(user);
                
                // Update refresh token
                user.RefreshToken = tokens.RefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                return Ok(tokens);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Refresh token error: {ex.Message}");
                return Unauthorized(new { message = "Invalid token" });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                    return Ok(new { message = "If the email exists, a password reset link will be sent" });

                // Generate password reset token
                var resetToken = GenerateSecureToken();
                user.PasswordResetToken = resetToken;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await _userManager.UpdateAsync(user);

                // Send password reset email
                var resetUrl = $"{Request.Scheme}://{Request.Host}/reset-password";
                await _emailService.SendPasswordResetEmailAsync(user.Email!, resetToken, resetUrl);

                return Ok(new { message = "If the email exists, a password reset link will be sent" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Forgot password error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.PasswordResetToken == model.Token && 
                                            u.PasswordResetTokenExpiry > DateTime.UtcNow);

                if (user == null)
                    return BadRequest(new { message = "Invalid or expired reset token" });

                var resetResult = await _userManager.RemovePasswordAsync(user);
                if (!resetResult.Succeeded)
                    return BadRequest(new { message = "Failed to reset password" });

                var addResult = await _userManager.AddPasswordAsync(user, model.Password);
                if (!addResult.Succeeded)
                    return BadRequest(new { message = "Failed to set new password", errors = addResult.Errors });

                // Clear reset token
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.RefreshToken = null; // Invalidate all sessions
                user.RefreshTokenExpiryTime = null;
                await _userManager.UpdateAsync(user);

                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Reset password error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        user.RefreshToken = null;
                        user.RefreshTokenExpiryTime = null;
                        await _userManager.UpdateAsync(user);
                    }
                }

                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Logout error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private async Task LogLoginAttempt(string userId, bool isSuccessful, string? failureReason)
        {
            try
            {
                var loginAttempt = new UserLoginAttempt
                {
                    UserId = userId,
                    IpAddress = GetClientIpAddress(),
                    UserAgent = Request.Headers["User-Agent"].ToString(),
                    IsSuccessful = isSuccessful,
                    FailureReason = failureReason
                };

                _context.UserLoginAttempts.Add(loginAttempt);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to log login attempt: {ex.Message}");
            }
        }

        private string GetClientIpAddress()
        {
            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
                return forwardedFor.Split(',')[0].Trim();

            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
                return realIp;

            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private static string GenerateSecureToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[32];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
        }
    }
}

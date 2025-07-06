using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<HealthController> _logger;

        public HealthController(
            ApplicationDbContext context,
            UserManager<User> userManager,
            ITokenService tokenService,
            ILogger<HealthController> logger)
        {
            _context = context;
            _userManager = userManager;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var healthInfo = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Database = "Unknown",
                UserManager = "Unknown",
                TokenService = "Unknown"
            };

            try
            {
                // Test database connection
                await _context.Database.CanConnectAsync();
                healthInfo = healthInfo with { Database = "Connected" };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Database connection failed: {ex.Message}");
                healthInfo = healthInfo with { Database = $"Failed: {ex.Message}" };
            }

            try
            {
                // Test UserManager
                var testUser = new User
                {
                    UserName = "test@test.com",
                    Email = "test@test.com",
                    FirstName = "Test",
                    LastName = "User",
                    Role = UserRole.Attendee
                };
                
                // Just validate, don't create
                var validationResult = await _userManager.CreateAsync(testUser, "TempPassword@123");
                healthInfo = healthInfo with { UserManager = "Available" };
            }
            catch (Exception ex)
            {
                _logger.LogError($"UserManager test failed: {ex.Message}");
                healthInfo = healthInfo with { UserManager = $"Failed: {ex.Message}" };
            }

            try
            {
                // Test TokenService
                var testUser = new User
                {
                    Id = "test-id",
                    UserName = "test@test.com",
                    Email = "test@test.com",
                    FirstName = "Test",
                    LastName = "User",
                    Role = UserRole.Attendee
                };
                
                var tokens = _tokenService.GenerateTokens(testUser);
                healthInfo = healthInfo with { TokenService = "Working" };
            }
            catch (Exception ex)
            {
                _logger.LogError($"TokenService test failed: {ex.Message}");
                healthInfo = healthInfo with { TokenService = $"Failed: {ex.Message}" };
            }

            return Ok(healthInfo);
        }

        [HttpGet("database")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    return BadRequest(new { message = "Cannot connect to database" });
                }

                var userCount = await _context.Users.CountAsync();
                var eventCount = await _context.Events.CountAsync();

                return Ok(new
                {
                    Status = "Database Connected",
                    UserCount = userCount,
                    EventCount = eventCount,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Database test failed: {ex.Message}");
                return StatusCode(500, new { message = "Database error", error = ex.Message });
            }
        }
    }
}

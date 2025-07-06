using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("users")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _userManager.Users
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.IsActive,
                    RegistrationDate = u.CreatedAt,
                    LastLoginDate = u.LastLoginDate,
                    u.ProfilePictureUrl
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("users/stats")]
        public async Task<ActionResult> GetUserStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var inactiveUsers = totalUsers - activeUsers;
            var newUsersThisMonth = await _userManager.Users
                .CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));

            var usersByRole = await _userManager.Users
                .GroupBy(u => u.Role)
                .Select(g => new { Role = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                InactiveUsers = inactiveUsers,
                NewUsersThisMonth = newUsersThisMonth,
                UsersByRole = usersByRole
            });
        }

        [HttpPatch("users/{userId}/status")]
        public async Task<ActionResult> UpdateUserStatus(string userId, [FromBody] UpdateUserStatusRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            user.IsActive = request.IsActive;
            await _userManager.UpdateAsync(user);

            return Ok();
        }

        [HttpPatch("users/{userId}/role")]
        public async Task<ActionResult> UpdateUserRole(string userId, [FromBody] UpdateUserRoleRequest request)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            if (Enum.TryParse<UserRole>(request.Role, out var role))
            {
                user.Role = role;
                await _userManager.UpdateAsync(user);
                return Ok();
            }

            return BadRequest("Invalid role");
        }

        [HttpDelete("users/{userId}")]
        public async Task<ActionResult> DeleteUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            await _userManager.DeleteAsync(user);
            return Ok();
        }

        [HttpGet("analytics")]
        public async Task<ActionResult> GetAnalytics()
        {
            var totalEvents = await _context.Events.CountAsync();
            var totalUsers = await _userManager.Users.CountAsync();
            var totalRegistrations = await _context.EventRegistrations.CountAsync();
            var activeEvents = await _context.Events.CountAsync(e => e.Status == EventStatus.Published && e.EndDate > DateTime.UtcNow);
            var newUsersThisMonth = await _userManager.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));

            // Calculate revenue (mock data for now)
            var revenue = await _context.Events
                .Where(e => e.TicketPrice.HasValue)
                .SumAsync(e => e.TicketPrice.Value * e.Registrations.Count());

            // Popular categories
            var popularCategories = await _context.Categories
                .Select(c => new
                {
                    c.Name,
                    Count = c.Events.Count(),
                    Percentage = c.Events.Count() * 100.0 / totalEvents
                })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Recent activity (mock data)
            var recentActivity = new[]
            {
                new { Type = "registration", Description = "New user registered", Timestamp = DateTime.UtcNow.AddMinutes(-30) },
                new { Type = "event", Description = "New event created", Timestamp = DateTime.UtcNow.AddHours(-1) },
                new { Type = "payment", Description = "Payment received", Timestamp = DateTime.UtcNow.AddHours(-2) },
            };

            // Monthly data (mock data)
            var monthlyData = Enumerable.Range(0, 6)
                .Select(i => new
                {
                    Month = DateTime.UtcNow.AddMonths(-i).ToString("MMMM"),
                    Events = Random.Shared.Next(80, 120),
                    Registrations = Random.Shared.Next(1000, 1600),
                    Revenue = Random.Shared.Next(15000, 25000)
                })
                .Reverse()
                .ToArray();

            return Ok(new
            {
                TotalEvents = totalEvents,
                TotalUsers = totalUsers,
                TotalRegistrations = totalRegistrations,
                Revenue = revenue,
                ActiveEvents = activeEvents,
                NewUsersThisMonth = newUsersThisMonth,
                PopularCategories = popularCategories,
                RecentActivity = recentActivity,
                MonthlyData = monthlyData
            });
        }

        [HttpGet("dashboard-stats")]
        public async Task<ActionResult> GetDashboardStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var totalEvents = await _context.Events.CountAsync();
            var totalVenues = await _context.Venues.CountAsync();
            var totalCategories = await _context.Categories.CountAsync();

            return Ok(new
            {
                TotalUsers = totalUsers,
                TotalEvents = totalEvents,
                TotalVenues = totalVenues,
                TotalCategories = totalCategories
            });
        }
    }

    public class UpdateUserStatusRequest
    {
        public bool IsActive { get; set; }
    }

    public class UpdateUserRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger<UserController> _logger;

        public UserController(UserManager<User> userManager, ILogger<UserController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? "",
                    Role = user.Role,
                    ProfileImageUrl = user.ProfileImageUrl,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    IsGoogleAuth = user.IsGoogleAuth
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Get profile error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                user.FirstName = model.FirstName;
                user.LastName = model.LastName;
                user.ProfileImageUrl = model.ProfileImageUrl;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { message = "Failed to update profile", errors = result.Errors });

                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? "",
                    Role = user.Role,
                    ProfileImageUrl = user.ProfileImageUrl,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    IsGoogleAuth = user.IsGoogleAuth
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Update profile error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                if (user.IsGoogleAuth)
                    return BadRequest(new { message = "Cannot change password for Google authenticated users" });

                var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (!result.Succeeded)
                    return BadRequest(new { message = "Failed to change password", errors = result.Errors });

                // Invalidate all refresh tokens to force re-login
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _userManager.UpdateAsync(user);

                return Ok(new { message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Change password error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("users")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var users = _userManager.Users
                    .OrderBy(u => u.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new UserDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email ?? "",
                        Role = u.Role,
                        ProfileImageUrl = u.ProfileImageUrl,
                        IsActive = u.IsActive,
                        CreatedAt = u.CreatedAt,
                        IsGoogleAuth = u.IsGoogleAuth
                    })
                    .ToList();

                var totalUsers = _userManager.Users.Count();

                return Ok(new
                {
                    users,
                    totalUsers,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling((double)totalUsers / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Get all users error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("users/{id}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateUserStatus(string id, [FromBody] bool isActive)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                user.IsActive = isActive;
                user.UpdatedAt = DateTime.UtcNow;

                // If deactivating, invalidate refresh tokens
                if (!isActive)
                {
                    user.RefreshToken = null;
                    user.RefreshTokenExpiryTime = null;
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                    return BadRequest(new { message = "Failed to update user status", errors = result.Errors });

                return Ok(new { message = $"User {(isActive ? "activated" : "deactivated")} successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Update user status error: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}

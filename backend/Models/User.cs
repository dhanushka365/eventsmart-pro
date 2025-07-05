using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; } = UserRole.Attendee;

        public string? ProfileImageUrl { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public string? RefreshToken { get; set; }
        
        public DateTime? RefreshTokenExpiryTime { get; set; }
        
        public string? PasswordResetToken { get; set; }
        
        public DateTime? PasswordResetTokenExpiry { get; set; }

        // OAuth Properties
        public string? GoogleId { get; set; }
        public bool IsGoogleAuth { get; set; } = false;

        // Navigation Properties
        public virtual ICollection<UserLoginAttempt> LoginAttempts { get; set; } = new List<UserLoginAttempt>();
    }

    public enum UserRole
    {
        Admin = 0,
        EventOrganizer = 1,
        Vendor = 2,
        Attendee = 3
    }
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Venue
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(300)]
        public string Address { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string ZipCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        public int Capacity { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [StringLength(500)]
        public string? Amenities { get; set; }

        [Column(TypeName = "decimal(10,8)")]
        public decimal? Latitude { get; set; }

        [Column(TypeName = "decimal(11,8)")]
        public decimal? Longitude { get; set; }

        public string? ImageUrl { get; set; }

        [StringLength(50)]
        public string? ContactPhone { get; set; }

        [StringLength(100)]
        public string? ContactEmail { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<Event> Events { get; set; } = new List<Event>();
    }
}
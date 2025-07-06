using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? AIGeneratedDescription { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string OrganizerId { get; set; } = string.Empty;

        [ForeignKey("OrganizerId")]
        public virtual User Organizer { get; set; } = null!;

        public int? VenueId { get; set; }

        [ForeignKey("VenueId")]
        public virtual Venue? Venue { get; set; }

        public int CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TicketPrice { get; set; }

        public int MaxAttendees { get; set; }

        public int CurrentAttendees { get; set; } = 0;

        public EventStatus Status { get; set; } = EventStatus.Draft;

        public string? ImageUrl { get; set; }

        [StringLength(1000)]
        public string? Requirements { get; set; }

        public bool IsPublic { get; set; } = true;

        public bool AllowWaitlist { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public virtual ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }

    public enum EventStatus
    {
        Draft = 0,
        Published = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4
    }
}
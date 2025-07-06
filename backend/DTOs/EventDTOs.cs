using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.DTOs
{
    public class CreateEventDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public int? VenueId { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public decimal? TicketPrice { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int MaxAttendees { get; set; }

        public string? ImageUrl { get; set; }

        public string? Requirements { get; set; }

        public bool IsPublic { get; set; } = true;

        public bool AllowWaitlist { get; set; } = false;
    }

    public class UpdateEventDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int? VenueId { get; set; }

        public int? CategoryId { get; set; }

        public decimal? TicketPrice { get; set; }

        public int? MaxAttendees { get; set; }

        public EventStatus? Status { get; set; }

        public string? ImageUrl { get; set; }

        public string? Requirements { get; set; }

        public bool? IsPublic { get; set; }

        public bool? AllowWaitlist { get; set; }
    }

    public class EventResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? AIGeneratedDescription { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string OrganizerId { get; set; } = string.Empty;
        public string OrganizerName { get; set; } = string.Empty;
        public VenueDto? Venue { get; set; }
        public CategoryDto Category { get; set; } = null!;
        public decimal? TicketPrice { get; set; }
        public int MaxAttendees { get; set; }
        public int CurrentAttendees { get; set; }
        public EventStatus Status { get; set; }
        public string? ImageUrl { get; set; }
        public string? Requirements { get; set; }
        public bool IsPublic { get; set; }
        public bool AllowWaitlist { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsUserRegistered { get; set; }
        public RegistrationStatus? UserRegistrationStatus { get; set; }
    }

    public class VenueDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class EventRegistration
    {
        public int Id { get; set; }

        public int EventId { get; set; }

        [ForeignKey("EventId")]
        public virtual Event Event { get; set; } = null!;

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public RegistrationStatus Status { get; set; } = RegistrationStatus.Registered;

        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public DateTime? CheckInTime { get; set; }

        public DateTime? CheckOutTime { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? AmountPaid { get; set; }

        public string? PaymentTransactionId { get; set; }

        public bool IsWaitlisted { get; set; } = false;

        public int? WaitlistPosition { get; set; }
    }

    public enum RegistrationStatus
    {
        Registered = 0,
        CheckedIn = 1,
        CheckedOut = 2,
        Cancelled = 3,
        NoShow = 4
    }
}
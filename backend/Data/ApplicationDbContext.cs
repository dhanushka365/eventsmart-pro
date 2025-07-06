using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<UserLoginAttempt> UserLoginAttempts { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<Venue> Venues { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<EventRegistration> EventRegistrations { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure User entity
            builder.Entity<User>(entity =>
            {
                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasConversion<int>();

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(e => e.GoogleId)
                    .IsUnique()
                    .HasFilter("[GoogleId] IS NOT NULL");
            });

            // Configure UserLoginAttempt entity
            builder.Entity<UserLoginAttempt>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.IpAddress)
                    .IsRequired()
                    .HasMaxLength(45); // To support IPv6

                entity.Property(e => e.UserAgent)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.AttemptedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.User)
                    .WithMany(u => u.LoginAttempts)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Event entity
            builder.Entity<Event>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .IsRequired()
                    .HasMaxLength(2000);

                entity.Property(e => e.TicketPrice)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Organizer)
                    .WithMany()
                    .HasForeignKey(e => e.OrganizerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Venue)
                    .WithMany(v => v.Events)
                    .HasForeignKey(e => e.VenueId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Category)
                    .WithMany(c => c.Events)
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure EventRegistration entity
            builder.Entity<EventRegistration>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.EventId)
                    .IsRequired();

                entity.Property(e => e.UserId)
                    .IsRequired();

                entity.Property(e => e.AmountPaid)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.RegistrationDate)
                    .HasDefaultValueSql("GETUTCDATE()");

                // Explicitly configure the Event relationship
                entity.HasOne(e => e.Event)
                    .WithMany(ev => ev.Registrations)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Explicitly configure the User relationship
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.EventId, e.UserId })
                    .IsUnique();
            });

            // Configure Review entity
            builder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Event)
                    .WithMany(ev => ev.Reviews)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.EventId, e.UserId })
                    .IsUnique();
            });

            // Configure Venue entity
            builder.Entity<Venue>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Address)
                    .IsRequired()
                    .HasMaxLength(300);

                entity.Property(e => e.Latitude)
                    .HasColumnType("decimal(10,8)");

                entity.Property(e => e.Longitude)
                    .HasColumnType("decimal(11,8)");

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Category entity
            builder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasIndex(e => e.Name)
                    .IsUnique();
            });
        }
    }
}

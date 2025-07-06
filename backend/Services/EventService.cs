using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace backend.Services
{
    public interface IEventService
    {
        Task<IEnumerable<EventResponseDto>> GetEventsAsync(string? search = null, int? categoryId = null, string? userId = null);
        Task<EventResponseDto?> GetEventByIdAsync(int id, string? userId = null);
        Task<EventResponseDto> CreateEventAsync(CreateEventDto dto, string organizerId);
        Task<EventResponseDto?> UpdateEventAsync(int id, UpdateEventDto dto, string userId);
        Task<bool> DeleteEventAsync(int id, string userId);
        Task<IEnumerable<EventResponseDto>> GetUserEventsAsync(string userId, bool asOrganizer = false);
        Task<bool> RegisterForEventAsync(int eventId, string userId);
        Task<bool> UnregisterFromEventAsync(int eventId, string userId);
        Task<bool> CheckInUserAsync(int eventId, string userId);
        Task<IEnumerable<EventResponseDto>> GetRecommendedEventsAsync(string userId);
    }

    public class EventService : IEventService
    {
        private readonly ApplicationDbContext _context;

        public EventService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EventResponseDto>> GetEventsAsync(string? search = null, int? categoryId = null, string? userId = null)
        {
            var query = _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Reviews)
                .Include(e => e.Registrations)
                .Where(e => e.IsPublic && e.Status == EventStatus.Published);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(e => e.Title.Contains(search) || e.Description.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            var events = await query.OrderBy(e => e.StartDate).ToListAsync();

            var result = new List<EventResponseDto>();
            foreach (var eventEntity in events)
            {
                result.Add(MapToEventResponseDto(eventEntity, userId));
            }
            return result;
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(int id, string? userId = null)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Reviews)
                .Include(e => e.Registrations)
                .FirstOrDefaultAsync(e => e.Id == id);

            return eventEntity == null ? null : MapToEventResponseDto(eventEntity, userId);
        }

        public async Task<EventResponseDto> CreateEventAsync(CreateEventDto dto, string organizerId)
        {
            var eventEntity = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                OrganizerId = organizerId,
                VenueId = dto.VenueId,
                CategoryId = dto.CategoryId,
                TicketPrice = dto.TicketPrice,
                MaxAttendees = dto.MaxAttendees,
                ImageUrl = dto.ImageUrl,
                Requirements = dto.Requirements,
                IsPublic = dto.IsPublic,
                AllowWaitlist = dto.AllowWaitlist,
                Status = EventStatus.Draft
            };

            _context.Events.Add(eventEntity);
            await _context.SaveChangesAsync();

            // Reload with includes for response
            eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Reviews)
                .Include(e => e.Registrations)
                .FirstAsync(e => e.Id == eventEntity.Id);

            return MapToEventResponseDto(eventEntity, organizerId);
        }

        public async Task<EventResponseDto?> UpdateEventAsync(int id, UpdateEventDto dto, string userId)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity == null || eventEntity.OrganizerId != userId)
                return null;

            // Update only provided fields
            if (!string.IsNullOrEmpty(dto.Title))
                eventEntity.Title = dto.Title;
            
            if (!string.IsNullOrEmpty(dto.Description))
                eventEntity.Description = dto.Description;
            
            if (dto.StartDate.HasValue)
                eventEntity.StartDate = dto.StartDate.Value;
            
            if (dto.EndDate.HasValue)
                eventEntity.EndDate = dto.EndDate.Value;
            
            if (dto.VenueId.HasValue)
                eventEntity.VenueId = dto.VenueId.Value;
            
            if (dto.CategoryId.HasValue)
                eventEntity.CategoryId = dto.CategoryId.Value;
            
            if (dto.TicketPrice.HasValue)
                eventEntity.TicketPrice = dto.TicketPrice.Value;
            
            if (dto.MaxAttendees.HasValue)
                eventEntity.MaxAttendees = dto.MaxAttendees.Value;
            
            if (dto.Status.HasValue)
                eventEntity.Status = dto.Status.Value;
            
            if (!string.IsNullOrEmpty(dto.ImageUrl))
                eventEntity.ImageUrl = dto.ImageUrl;
            
            if (!string.IsNullOrEmpty(dto.Requirements))
                eventEntity.Requirements = dto.Requirements;
            
            if (dto.IsPublic.HasValue)
                eventEntity.IsPublic = dto.IsPublic.Value;
            
            if (dto.AllowWaitlist.HasValue)
                eventEntity.AllowWaitlist = dto.AllowWaitlist.Value;

            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with includes
            eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Reviews)
                .Include(e => e.Registrations)
                .FirstAsync(e => e.Id == id);

            return MapToEventResponseDto(eventEntity, userId);
        }

        public async Task<bool> DeleteEventAsync(int id, string userId)
        {
            var eventEntity = await _context.Events
                .FirstOrDefaultAsync(e => e.Id == id && e.OrganizerId == userId);

            if (eventEntity == null)
                return false;

            _context.Events.Remove(eventEntity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<EventResponseDto>> GetUserEventsAsync(string userId, bool asOrganizer = false)
        {
            List<Event> events;

            if (asOrganizer)
            {
                events = await _context.Events
                    .Include(e => e.Organizer)
                    .Include(e => e.Venue)
                    .Include(e => e.Category)
                    .Include(e => e.Reviews)
                    .Include(e => e.Registrations)
                    .Where(e => e.OrganizerId == userId)
                    .OrderBy(e => e.StartDate)
                    .ToListAsync();
            }
            else
            {
                // Get user's registered events
                var registeredEventIds = await _context.EventRegistrations
                    .Where(r => r.UserId == userId)
                    .Select(r => r.EventId)
                    .ToListAsync();

                events = await _context.Events
                    .Include(e => e.Organizer)
                    .Include(e => e.Venue)
                    .Include(e => e.Category)
                    .Include(e => e.Reviews)
                    .Include(e => e.Registrations)
                    .Where(e => registeredEventIds.Contains(e.Id))
                    .OrderBy(e => e.StartDate)
                    .ToListAsync();
            }

            var result = new List<EventResponseDto>();
            foreach (var eventEntity in events)
            {
                result.Add(MapToEventResponseDto(eventEntity, userId));
            }
            return result;
        }

        public async Task<bool> RegisterForEventAsync(int eventId, string userId)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Registrations)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (eventEntity == null || eventEntity.Status != EventStatus.Published)
                return false;

            // Check if already registered
            var existingRegistration = eventEntity.Registrations
                .FirstOrDefault(r => r.UserId == userId);
            
            if (existingRegistration != null)
                return false;

            // Check capacity
            if (eventEntity.CurrentAttendees >= eventEntity.MaxAttendees)
            {
                if (!eventEntity.AllowWaitlist)
                    return false;

                // Add to waitlist
                var waitlistCount = eventEntity.Registrations.Count(r => r.IsWaitlisted);
                var waitlistRegistration = new EventRegistration
                {
                    EventId = eventId,
                    UserId = userId,
                    IsWaitlisted = true,
                    WaitlistPosition = waitlistCount + 1,
                    Status = RegistrationStatus.Registered
                };

                _context.EventRegistrations.Add(waitlistRegistration);
            }
            else
            {
                var registration = new EventRegistration
                {
                    EventId = eventId,
                    UserId = userId,
                    Status = RegistrationStatus.Registered
                };

                _context.EventRegistrations.Add(registration);
                eventEntity.CurrentAttendees++;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UnregisterFromEventAsync(int eventId, string userId)
        {
            var registration = await _context.EventRegistrations
                .Include(r => r.Event)
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId);

            if (registration == null)
                return false;

            var eventEntity = registration.Event;

            _context.EventRegistrations.Remove(registration);

            if (!registration.IsWaitlisted)
            {
                eventEntity.CurrentAttendees--;

                // Promote from waitlist if applicable
                var nextWaitlisted = await _context.EventRegistrations
                    .Where(r => r.EventId == eventId && r.IsWaitlisted)
                    .OrderBy(r => r.WaitlistPosition)
                    .FirstOrDefaultAsync();

                if (nextWaitlisted != null)
                {
                    nextWaitlisted.IsWaitlisted = false;
                    nextWaitlisted.WaitlistPosition = null;
                    eventEntity.CurrentAttendees++;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckInUserAsync(int eventId, string userId)
        {
            var registration = await _context.EventRegistrations
                .FirstOrDefaultAsync(r => r.EventId == eventId && r.UserId == userId && !r.IsWaitlisted);

            if (registration == null)
                return false;

            registration.Status = RegistrationStatus.CheckedIn;
            registration.CheckInTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<EventResponseDto>> GetRecommendedEventsAsync(string userId)
        {
            // Get user's past event categories
            var userRegistrations = await _context.EventRegistrations
                .Include(r => r.Event)
                .Where(r => r.UserId == userId)
                .ToListAsync();

            var userCategories = userRegistrations
                .Select(r => r.Event.CategoryId)
                .Distinct()
                .ToList();

            if (!userCategories.Any())
            {
                // Return popular events if no history
                var popularEvents = await _context.Events
                    .Include(e => e.Organizer)
                    .Include(e => e.Venue)
                    .Include(e => e.Category)
                    .Include(e => e.Reviews)
                    .Include(e => e.Registrations)
                    .Where(e => e.IsPublic && e.Status == EventStatus.Published && e.StartDate > DateTime.UtcNow)
                    .OrderByDescending(e => e.CurrentAttendees)
                    .Take(10)
                    .ToListAsync();

                var popularResult = new List<EventResponseDto>();
                foreach (var eventEntity in popularEvents)
                {
                    popularResult.Add(MapToEventResponseDto(eventEntity, userId));
                }
                return popularResult;
            }

            // Get user's registered event IDs to exclude
            var registeredEventIds = userRegistrations.Select(r => r.EventId).ToList();

            var recommendedEvents = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .Include(e => e.Reviews)
                .Include(e => e.Registrations)
                .Where(e => e.IsPublic && 
                           e.Status == EventStatus.Published && 
                           e.StartDate > DateTime.UtcNow &&
                           userCategories.Contains(e.CategoryId) &&
                           !registeredEventIds.Contains(e.Id))
                .OrderBy(e => e.StartDate)
                .Take(10)
                .ToListAsync();

            var result = new List<EventResponseDto>();
            foreach (var eventEntity in recommendedEvents)
            {
                result.Add(MapToEventResponseDto(eventEntity, userId));
            }
            return result;
        }

        private EventResponseDto MapToEventResponseDto(Event eventEntity, string? userId = null)
        {
            EventRegistration? userRegistration = null;
            if (userId != null)
            {
                userRegistration = eventEntity.Registrations
                    .FirstOrDefault(r => r.UserId == userId);
            }

            // Calculate average rating safely
            double averageRating = 0;
            if (eventEntity.Reviews != null && eventEntity.Reviews.Any())
            {
                averageRating = eventEntity.Reviews.Average(r => (double)r.Rating);
            }

            return new EventResponseDto
            {
                Id = eventEntity.Id,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                AIGeneratedDescription = eventEntity.AIGeneratedDescription,
                StartDate = eventEntity.StartDate,
                EndDate = eventEntity.EndDate,
                OrganizerId = eventEntity.OrganizerId,
                OrganizerName = $"{eventEntity.Organizer.FirstName} {eventEntity.Organizer.LastName}",
                Venue = eventEntity.Venue != null ? new VenueDto
                {
                    Id = eventEntity.Venue.Id,
                    Name = eventEntity.Venue.Name,
                    Address = eventEntity.Venue.Address,
                    City = eventEntity.Venue.City,
                    State = eventEntity.Venue.State,
                    Country = eventEntity.Venue.Country,
                    Capacity = eventEntity.Venue.Capacity,
                    Latitude = eventEntity.Venue.Latitude,
                    Longitude = eventEntity.Venue.Longitude
                } : null,
                Category = new CategoryDto
                {
                    Id = eventEntity.Category.Id,
                    Name = eventEntity.Category.Name,
                    Description = eventEntity.Category.Description,
                    IconUrl = eventEntity.Category.IconUrl,
                    Color = eventEntity.Category.Color
                },
                TicketPrice = eventEntity.TicketPrice,
                MaxAttendees = eventEntity.MaxAttendees,
                CurrentAttendees = eventEntity.CurrentAttendees,
                Status = eventEntity.Status,
                ImageUrl = eventEntity.ImageUrl,
                Requirements = eventEntity.Requirements,
                IsPublic = eventEntity.IsPublic,
                AllowWaitlist = eventEntity.AllowWaitlist,
                CreatedAt = eventEntity.CreatedAt,
                UpdatedAt = eventEntity.UpdatedAt,
                AverageRating = averageRating,
                ReviewCount = eventEntity.Reviews?.Count ?? 0,
                IsUserRegistered = userRegistration != null,
                UserRegistrationStatus = userRegistration?.Status
            };
        }
    }
}

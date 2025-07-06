using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VenuesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VenueDto>>> GetVenues()
        {
            var venues = await _context.Venues
                .Where(v => v.IsActive)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    State = v.State,
                    Country = v.Country,
                    Capacity = v.Capacity,
                    Description = v.Description,
                    Amenities = v.Amenities,
                    Latitude = v.Latitude,
                    Longitude = v.Longitude,
                    ImageUrl = v.ImageUrl,
                    ContactPhone = v.ContactPhone,
                    ContactEmail = v.ContactEmail
                })
                .ToListAsync();

            return Ok(venues);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<VenueDto>> GetVenue(int id)
        {
            var venue = await _context.Venues
                .Where(v => v.Id == id && v.IsActive)
                .Select(v => new VenueDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    State = v.State,
                    Country = v.Country,
                    Capacity = v.Capacity,
                    Description = v.Description,
                    Amenities = v.Amenities,
                    Latitude = v.Latitude,
                    Longitude = v.Longitude,
                    ImageUrl = v.ImageUrl,
                    ContactPhone = v.ContactPhone,
                    ContactEmail = v.ContactEmail
                })
                .FirstOrDefaultAsync();

            if (venue == null)
                return NotFound();

            return Ok(venue);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,EventOrganizer")]
        public async Task<ActionResult<VenueDto>> CreateVenue(CreateVenueDto dto)
        {
            var venue = new Venue
            {
                Name = dto.Name,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Country = dto.Country,
                Capacity = dto.Capacity,
                Description = dto.Description,
                Amenities = dto.Amenities,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                ImageUrl = dto.ImageUrl,
                ContactPhone = dto.ContactPhone,
                ContactEmail = dto.ContactEmail
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            var venueDto = new VenueDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Address = venue.Address,
                City = venue.City,
                State = venue.State,
                Country = venue.Country,
                Capacity = venue.Capacity,
                Description = venue.Description,
                Amenities = venue.Amenities,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                ImageUrl = venue.ImageUrl,
                ContactPhone = venue.ContactPhone,
                ContactEmail = venue.ContactEmail
            };

            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, venueDto);
        }
    }
}

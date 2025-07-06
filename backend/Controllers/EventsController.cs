using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventsController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly IAIService _aiService;

        public EventsController(IEventService eventService, IAIService aiService)
        {
            _eventService = eventService;
            _aiService = aiService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetEvents(
            [FromQuery] string? search = null, 
            [FromQuery] int? categoryId = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var events = await _eventService.GetEventsAsync(search, categoryId, userId);
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponseDto>> GetEvent(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var eventDto = await _eventService.GetEventByIdAsync(id, userId);
            
            if (eventDto == null)
                return NotFound();

            return Ok(eventDto);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<EventResponseDto>> CreateEvent(CreateEventDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var eventDto = await _eventService.CreateEventAsync(dto, userId);
            return CreatedAtAction(nameof(GetEvent), new { id = eventDto.Id }, eventDto);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<EventResponseDto>> UpdateEvent(int id, UpdateEventDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var eventDto = await _eventService.UpdateEventAsync(id, dto, userId);
            
            if (eventDto == null)
                return NotFound();

            return Ok(eventDto);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _eventService.DeleteEventAsync(id, userId);
            
            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("my-events")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetMyEvents([FromQuery] bool asOrganizer = false)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var events = await _eventService.GetUserEventsAsync(userId, asOrganizer);
            return Ok(events);
        }

        [HttpPost("{id}/register")]
        [Authorize]
        public async Task<IActionResult> RegisterForEvent(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _eventService.RegisterForEventAsync(id, userId);
            
            if (!result)
                return BadRequest("Unable to register for event");

            return Ok();
        }

        [HttpDelete("{id}/register")]
        [Authorize]
        public async Task<IActionResult> UnregisterFromEvent(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _eventService.UnregisterFromEventAsync(id, userId);
            
            if (!result)
                return BadRequest("Unable to unregister from event");

            return Ok();
        }

        [HttpPost("{id}/checkin")]
        [Authorize]
        public async Task<IActionResult> CheckInToEvent(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _eventService.CheckInUserAsync(id, userId);
            
            if (!result)
                return BadRequest("Unable to check in to event");

            return Ok();
        }

        [HttpGet("recommendations")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetRecommendedEvents()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var events = await _eventService.GetRecommendedEventsAsync(userId);
            return Ok(events);
        }

        [HttpPost("{id}/generate-description")]
        [Authorize]
        public async Task<ActionResult<string>> GenerateEventDescription(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var eventDto = await _eventService.GetEventByIdAsync(id, userId);
            if (eventDto == null || eventDto.OrganizerId != userId)
                return NotFound();

            var aiDescription = await _aiService.GenerateEventDescriptionAsync(
                eventDto.Title, 
                eventDto.Category.Name, 
                eventDto.Description);

            return Ok(new { description = aiDescription });
        }

        [HttpGet("{id}/planning-tips")]
        [Authorize]
        public async Task<ActionResult<List<string>>> GetEventPlanningTips(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var eventDto = await _eventService.GetEventByIdAsync(id, userId);
            if (eventDto == null || eventDto.OrganizerId != userId)
                return NotFound();

            var tips = await _aiService.GetEventPlanningTipsAsync(
                eventDto.Category.Name, 
                eventDto.StartDate, 
                eventDto.MaxAttendees);

            return Ok(tips);
        }

        [HttpPost("{id}/generate-summary")]
        [Authorize]
        public async Task<ActionResult<string>> GenerateEventSummary(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var eventDto = await _eventService.GetEventByIdAsync(id, userId);
            if (eventDto == null || eventDto.OrganizerId != userId)
                return NotFound();

            var summary = await _aiService.GenerateEventSummaryAsync(id);
            return Ok(new { summary });
        }
    }
}

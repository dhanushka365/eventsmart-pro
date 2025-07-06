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
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => c.IsActive)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    IconUrl = c.IconUrl,
                    Color = c.Color,
                    EventCount = c.Events.Count(e => e.IsPublic && e.Status == EventStatus.Published)
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id && c.IsActive)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    IconUrl = c.IconUrl,
                    Color = c.Color,
                    EventCount = c.Events.Count(e => e.IsPublic && e.Status == EventStatus.Published)
                })
                .FirstOrDefaultAsync();

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                IconUrl = dto.IconUrl,
                Color = dto.Color
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IconUrl = category.IconUrl,
                Color = category.Color,
                EventCount = 0
            };

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, categoryDto);
        }
    }
}

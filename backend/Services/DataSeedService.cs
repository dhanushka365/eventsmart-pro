using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IDataSeedService
    {
        Task SeedInitialDataAsync();
    }

    public class DataSeedService : IDataSeedService
    {
        private readonly ApplicationDbContext _context;

        public DataSeedService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedInitialDataAsync()
        {
            await SeedCategoriesAsync();
            await SeedVenuesAsync();
        }

        private async Task SeedCategoriesAsync()
        {
            if (await _context.Categories.AnyAsync())
                return;

            var categories = new[]
            {
                new Category { Name = "Conference", Description = "Professional conferences and seminars", IconUrl = "🎯", Color = "#3B82F6" },
                new Category { Name = "Workshop", Description = "Hands-on learning workshops", IconUrl = "🔨", Color = "#8B5CF6" },
                new Category { Name = "Networking", Description = "Professional networking events", IconUrl = "🤝", Color = "#10B981" },
                new Category { Name = "Social", Description = "Social gatherings and parties", IconUrl = "🎉", Color = "#F59E0B" },
                new Category { Name = "Sports", Description = "Sports events and competitions", IconUrl = "⚽", Color = "#EF4444" },
                new Category { Name = "Music", Description = "Concerts and music events", IconUrl = "🎵", Color = "#EC4899" },
                new Category { Name = "Art & Culture", Description = "Art exhibitions and cultural events", IconUrl = "🎨", Color = "#6366F1" },
                new Category { Name = "Technology", Description = "Tech meetups and hackathons", IconUrl = "💻", Color = "#059669" },
                new Category { Name = "Education", Description = "Educational seminars and courses", IconUrl = "📚", Color = "#7C3AED" },
                new Category { Name = "Food & Drink", Description = "Culinary events and tastings", IconUrl = "🍽️", Color = "#DC2626" }
            };

            await _context.Categories.AddRangeAsync(categories);
            await _context.SaveChangesAsync();
        }

        private async Task SeedVenuesAsync()
        {
            if (await _context.Venues.AnyAsync())
                return;

            var venues = new[]
            {
                new Venue 
                { 
                    Name = "Grand Convention Center", 
                    Address = "123 Convention Ave", 
                    City = "New York", 
                    State = "NY", 
                    ZipCode = "10001", 
                    Country = "USA", 
                    Capacity = 1000,
                    Description = "Modern convention center with state-of-the-art facilities",
                    Amenities = "Wi-Fi, Parking, Catering, Audio/Visual Equipment",
                    Latitude = 40.7589m,
                    Longitude = -73.9851m
                },
                new Venue 
                { 
                    Name = "Tech Hub Auditorium", 
                    Address = "456 Innovation Drive", 
                    City = "San Francisco", 
                    State = "CA", 
                    ZipCode = "94105", 
                    Country = "USA", 
                    Capacity = 500,
                    Description = "Modern auditorium perfect for tech events",
                    Amenities = "High-speed Wi-Fi, Streaming Equipment, Coffee Bar",
                    Latitude = 37.7749m,
                    Longitude = -122.4194m
                },
                new Venue 
                { 
                    Name = "Community Arts Center", 
                    Address = "789 Culture Street", 
                    City = "Los Angeles", 
                    State = "CA", 
                    ZipCode = "90210", 
                    Country = "USA", 
                    Capacity = 300,
                    Description = "Intimate venue for cultural and artistic events",
                    Amenities = "Gallery Space, Sound System, Flexible Seating",
                    Latitude = 34.0522m,
                    Longitude = -118.2437m
                },
                new Venue 
                { 
                    Name = "Business Plaza Conference Room", 
                    Address = "321 Corporate Blvd", 
                    City = "Chicago", 
                    State = "IL", 
                    ZipCode = "60601", 
                    Country = "USA", 
                    Capacity = 150,
                    Description = "Professional conference facility for business events",
                    Amenities = "Presentation Equipment, Catering Kitchen, Parking",
                    Latitude = 41.8781m,
                    Longitude = -87.6298m
                },
                new Venue 
                { 
                    Name = "Outdoor Pavilion", 
                    Address = "654 Park Lane", 
                    City = "Austin", 
                    State = "TX", 
                    ZipCode = "73301", 
                    Country = "USA", 
                    Capacity = 800,
                    Description = "Beautiful outdoor venue for festivals and large gatherings",
                    Amenities = "Stage, Food Vendors, Restrooms, Weather Protection",
                    Latitude = 30.2672m,
                    Longitude = -97.7431m
                }
            };

            await _context.Venues.AddRangeAsync(venues);
            await _context.SaveChangesAsync();
        }
    }
}

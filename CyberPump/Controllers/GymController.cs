using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CyberPump.Data;
using CyberPump.Models;
using Microsoft.EntityFrameworkCore;

namespace CyberPump.Controllers
{
    [Route("api/gym")]
    [ApiController]
    public class GymsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GymsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/gym
        [HttpGet]
        public async Task<IActionResult> GetGyms()
        {
            var gyms = await _context.Gyms.ToListAsync();
            return Ok(gyms);
        }

        // GET: api/gym/city/Cairo
        [HttpGet("city/{cityName}")]
        public async Task<ActionResult<IEnumerable<Gym>>> GetGymsByCity(string cityName)
        {
            if (string.IsNullOrEmpty(cityName) || cityName == "All")
            {
                return await _context.Gyms.ToListAsync();
            }
            return await _context.Gyms
                .Where(g => g.City == cityName)
                .ToListAsync();
        }

        // POST: api/gym/seed
        [HttpPost("seed")]
        public async Task<IActionResult> SeedGyms()
        {
            if (await _context.Gyms.AnyAsync())
            {
                return BadRequest(new { message = "Gyms already seeded" });
            }

            var gyms = new List<Gym>
            {
                new Gym
                {
                    Name = "Gold's Gym",
                    City = "Cairo",              // <--- Added CITY
                    Location = "Maadi, Degla",   // <--- Location is now the address
                    Rating = 4.8,
                    ImageUrl = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
                    Timings = "6:00 AM - 12:00 AM",
                    Description = "Premium equipment and world-class trainers.",
                    Features = "AC, Sauna, Pool, Cardio",
                    Price = 50.00m
                },
                new Gym
                {
                    Name = "Alexandria Fitness Club",
                    City = "Alexandria",         // <--- Added CITY
                    Location = "San Stefano Mall",
                    Rating = 4.5,
                    ImageUrl = "https://images.unsplash.com/photo-1540497077202-7c8a336322b4",
                    Timings = "5:00 AM - 11:00 PM",
                    Description = "The best view while you train.",
                    Features = "AC, Wi-Fi, Sea View",
                    Price = 40.00m
                }
            };

            await _context.Gyms.AddRangeAsync(gyms);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Database Seeded Successfully!" });
        }
    }
}
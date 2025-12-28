using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CyberPump.Data;
using CyberPump.Models;
using Microsoft.EntityFrameworkCore;

namespace CyberPump.Controllers
{
    [Route("api/meal")]
    [ApiController]
    public class MealsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MealsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet("user/{userId}/date/{date}")]
        public async Task<IActionResult> GetMeals(int userId, string date)
        {
            // Parse the date string from JS (yyyy-mm-dd)
            if (!DateTime.TryParse(date, out DateTime parsedDate))
            {
                return BadRequest("Invalid date format");
            }

            var meals = await _context.Meals
                 .Where(m => m.UserId == userId && m.Date.Date == parsedDate.Date)
                 .ToListAsync();

            // FIX 3: Return an object with a "meals" property so "data.meals" works in JS
            return Ok(new { meals = meals });
        }

        // POST: api/meal
        [HttpPost]
        public async Task<IActionResult> AddMeal([FromBody] Meal meal)
        {
            if (meal == null)
            {
                return BadRequest("Meal data is null");
            }

            _context.Meals.Add(meal);
            await _context.SaveChangesAsync();

            // Return the created meal so "addMealToScreen(savedMeal)" works
            return Ok(meal);
        }
    }
}
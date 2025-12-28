using Microsoft.AspNetCore.Mvc;
using CyberPump.Data;
using CyberPump.Models;
using Microsoft.EntityFrameworkCore;

namespace CyberPump.Controllers
{
    [Route("api/workout")]
    [ApiController]
    public class WorkoutController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/workout/user/1
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetWorkouts(int userId)
        {
            var workouts = await _context.Workouts
                .Where(w => w.UserId == userId)
                .ToListAsync();

            return Ok(workouts);
        }

        // POST: api/workout
        [HttpPost]
        public async Task<IActionResult> SaveWorkout([FromBody] Workout workout)
        {
            if (workout == null)
            {
                return BadRequest("No data provided");
            }

            var existingWorkout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.UserId == workout.UserId && w.DayOfWeek == workout.DayOfWeek);

            if (existingWorkout != null)
            {
                existingWorkout.Exercises = workout.Exercises;
            }
            else
            {
                _context.Workouts.Add(workout);
            }

            await _context.SaveChangesAsync();
            return Ok(workout);
        }
    }
}
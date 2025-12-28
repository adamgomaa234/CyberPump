// Get user ID from session (or default to 1 for testing)
const userId = sessionStorage.getItem('userId') || 1;

// Grab elements
const dayButtons = document.querySelectorAll(".day-btn");
const title = document.getElementById("current-day-title");
const exerciseListContainer = document.getElementById("exercise-list-container");
const addBtn = document.getElementById("add-exercise-btn");

// Store exercises for each day
const exercises = {
    Saturday: [],
    Sunday: [],
    Monday: [],
    Wednesday: [],
    Thursday: []
};

// Default current day
let currentDay = "Saturday";

async function loadWorkouts() {
    try {
        const response = await fetch(`/api/workout/user/${userId}`);
        if (response.ok) {
            const workouts = await response.json();

            workouts.forEach(workout => {
                // FIX: Check both "dayOfWeek" (lowercase) and "DayOfWeek" (uppercase)
                const day = workout.dayOfWeek || workout.DayOfWeek;
                const exList = workout.exercises || workout.Exercises;

                if (exercises.hasOwnProperty(day)) {
                    // Load the existing list so we don't overwrite it later
                    exercises[day] = JSON.parse(exList || '[]');
                }
            });
            renderExercises(currentDay);
            updateSummary();
        }
    } catch (error) {
        console.error('Error loading workouts:', error);
        renderExercises(currentDay);
    }
}

// Save workout to database
async function saveWorkout(day) {
    try {
        const response = await fetch('/api/workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: parseInt(userId),
                dayOfWeek: day,
                exercises: JSON.stringify(exercises[day])
            })
        });

        if (!response.ok) {
            console.error('Failed to save workout');
        }
    } catch (error) {
        console.error('Error saving workout:', error);
    }
}

// Function to render exercises
function renderExercises(day) {
    exerciseListContainer.innerHTML = "";

    if (exercises[day].length > 0) {
        const ul = document.createElement("ul");
        ul.classList.add("exercise-list");
        exercises[day].forEach((ex, index) => {
            const li = document.createElement("li");
            li.textContent = ex;
            const delBtn = document.createElement("button");
            delBtn.textContent = "✕";
            delBtn.classList.add("delete-btn");
            delBtn.addEventListener("click", async () => {
                exercises[day].splice(index, 1);
                await saveWorkout(day);
                renderExercises(day);
            });

            li.appendChild(delBtn);
            ul.appendChild(li);
        });
        exerciseListContainer.appendChild(ul);
    } else {
        exerciseListContainer.innerHTML = "<p>No exercises added yet.</p>";
    }
}

// Day button click
dayButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        dayButtons.forEach(b => b.classList.remove("active-day"));
        this.classList.add("active-day");

        currentDay = this.getAttribute("data-day");
        title.textContent = `${currentDay}'s Workout`;

        renderExercises(currentDay);
    });
});

// Add exercise button
addBtn.addEventListener("click", async () => {
    const newExercise = prompt(`Add new exercise for ${currentDay}:`);
    if (newExercise && newExercise.trim() !== "") {
        exercises[currentDay].push(newExercise.trim());
        await saveWorkout(currentDay);
        renderExercises(currentDay);
    }
});

// Load workouts on page load
loadWorkouts();
document.addEventListener("DOMContentLoaded", () => {
    // Get user ID from session (or default to 1 for testing)
    const userId = sessionStorage.getItem('userId') || 1;

    // Setup date input
    const dateInput = document.getElementById("myDate");
    dateInput.value = new Date().toISOString().split("T")[0];

    // Summary elements
    const totalEl = {
        cals: document.getElementById("totalCalories"),
        protein: document.getElementById("totalProtein"),
        carbs: document.getElementById("totalCarbs"),
        fat: document.getElementById("totalFat")
    };

    let currentSummary = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Load meals from database
    async function loadMealsForDate() {
        const date = dateInput.value;
        resetUI();

        try {
            const response = await fetch(`/api/meal/user/${userId}/date/${date}`);
            if (response.ok) {
                const data = await response.json();

                // Backend returns { meals: [...], totalCalories, totalProtein, etc }
                if (data.meals && data.meals.length > 0) {
                    data.meals.forEach(meal => addMealToScreen(meal));
                }
            }
        } catch (error) {
            console.error("Error loading meals:", error);
        }
    }

    // Add meal to screen
    function addMealToScreen(meal) {
        const mealType = meal.mealType.toLowerCase();
        const btn = document.querySelector(`button[data-meal="${mealType}"]`);

        if (!btn) return;

        const container = btn.parentElement;
        const statusText = container.querySelector(".meal_status");
        if (statusText) {
            statusText.style.display = "none";
        }

        const foodDiv = document.createElement("div");
        foodDiv.className = "food-entry";
        foodDiv.style.border = "1px solid #333";
        foodDiv.style.borderRadius = "10px";
        foodDiv.style.padding = "10px";
        foodDiv.style.background = "#222";
        foodDiv.style.marginBottom = "10px";

        foodDiv.innerHTML = `
            <strong style="color: white;">${meal.foodName}</strong><br>
            <span style="color:#e74c3c;">${meal.calories} kcal</span><br>
            <span style="color:#27ae60;">P: ${meal.protein}g</span> | 
            <span style="color:#2980b9;">C: ${meal.carbs}g</span> | 
            <span style="color:#f39c12;">F: ${meal.fat}g</span>
        `;

        container.insertBefore(foodDiv, btn);
        updateSummary(meal.calories, meal.protein, meal.carbs, meal.fat);
    }

    function updateSummary(cals, p, c, f) {
        currentSummary.calories += cals;
        currentSummary.protein += p;
        currentSummary.carbs += c;
        currentSummary.fat += f;

        totalEl.cals.textContent = Math.round(currentSummary.calories) + " kcal";
        totalEl.protein.textContent = Math.round(currentSummary.protein) + " g";
        totalEl.carbs.textContent = Math.round(currentSummary.carbs) + " g";
        totalEl.fat.textContent = Math.round(currentSummary.fat) + " g";
    }

    function resetUI() {
        currentSummary = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        totalEl.cals.textContent = "0 kcal";
        totalEl.protein.textContent = "0 g";
        totalEl.carbs.textContent = "0 g";
        totalEl.fat.textContent = "0 g";

        document.querySelectorAll(".meal_Category").forEach(cat => {
            cat.querySelectorAll(".food-entry").forEach(el => el.remove());
            const status = cat.querySelector(".meal_status");
            if (status) status.style.display = "block";
        });
    }

    // Date change event
    dateInput.addEventListener("change", loadMealsForDate);

    // Popup Logic
    const mealButtons = document.querySelectorAll(".meal_btn");
    const macrosPopup = document.getElementById("macros");
    const saveBtn = document.getElementById("saveFood");
    const closeBtn = document.getElementById("closePopup");
    let activeMealType = null;

    mealButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            activeMealType = btn.getAttribute("data-meal");
            macrosPopup.style.display = "flex";
            document.getElementById("foodName").value = "";
            document.getElementById("cals").value = "";
            document.getElementById("protein").value = "";
            document.getElementById("carbs").value = "";
            document.getElementById("fats").value = "";
        });
    });

    closeBtn.addEventListener("click", () => macrosPopup.style.display = "none");

    // Save food to database
    saveBtn.addEventListener("click", async () => {
        const foodName = document.getElementById("foodName").value.trim();
        const cals = parseFloat(document.getElementById("cals").value) || 0;
        const protein = parseFloat(document.getElementById("protein").value) || 0;
        const carbs = parseFloat(document.getElementById("carbs").value) || 0;
        const fats = parseFloat(document.getElementById("fats").value) || 0;

        if (!foodName) {
            alert("Please enter a food name");
            return;
        }

        const newMeal = {
            userId: parseInt(userId),
            date: dateInput.value,
            mealType: activeMealType,
            foodName: foodName,
            calories: Math.round(cals),
            protein: protein,
            carbs: carbs,
            fat: fats
        };

        try {
            const res = await fetch('/api/meal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMeal)
            });

            if (res.ok) {
                const savedMeal = await res.json();
                addMealToScreen(savedMeal);
                macrosPopup.style.display = "none";
            } else {
                const error = await res.json();
                alert("Error: " + (error.message || "Could not save meal"));
            }
        } catch (err) {
            console.error(err);
            alert("Connection error. Make sure the server is running!");
        }
    });

    // Healthy Meals Popup
    const healthBtn = document.getElementById("healthy");
    const healthPop = document.getElementById("healthyMealsPopup");
    const closeHealthBtn = document.getElementById('cancelbtn');

    healthBtn.addEventListener("click", () => healthPop.style.display = "flex");
    closeHealthBtn.addEventListener('click', () => healthPop.style.display = "none");

    // Add healthy meals to tracker
    document.querySelectorAll(".addTrackerBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const mealSectionId = btn.dataset.mealId;
            const mealDiv = btn.parentElement;

            const getNum = (str) => parseFloat(str.match(/[\d.]+/)?.[0] || 0);

            const name = mealDiv.querySelector("h3").textContent;
            const cals = getNum(mealDiv.querySelector("p:nth-of-type(1)").textContent);
            const macrosText = mealDiv.querySelector("p:nth-of-type(2)").textContent.split("•");

            const healthyMeal = {
                userId: parseInt(userId),
                date: dateInput.value,
                mealType: mealSectionId,
                foodName: name,
                calories: Math.round(cals),
                protein: getNum(macrosText[0]),
                carbs: getNum(macrosText[1]),
                fat: getNum(macrosText[2])
            };

            try {
                const res = await fetch('/api/meal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(healthyMeal)
                });

                if (res.ok) {
                    const savedMeal = await res.json();
                    addMealToScreen(savedMeal);
                    healthPop.style.display = "none";
                } else {
                    alert("Error saving meal");
                }
            } catch (err) {
                console.error(err);
                alert("Connection error!");
            }
        });
    });

    // Close popup by clicking outside
    window.addEventListener("click", e => {
        if (e.target === macrosPopup) macrosPopup.style.display = "none";
        if (e.target === healthPop) healthPop.style.display = "none";
    });

    // Initial load
    loadMealsForDate();
});
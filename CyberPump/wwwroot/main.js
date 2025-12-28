// Get today's date
const today = new Date();

// Format date (Dec 29, 2025)
const options = { year: 'numeric', month: 'short', day: 'numeric' };
const formattedDate = today.toLocaleDateString('en-US', options);

// Insert date into the span
document.getElementById("today-date").textContent = formattedDate;
console.log(document.getElementById("today-date"));

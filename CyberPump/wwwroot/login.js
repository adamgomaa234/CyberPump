// Tabs
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

// Forms
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Buttons
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

// Inputs
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const age = document.getElementById("age");
const email = document.getElementById("email");
const password = document.getElementById("password");

// Error messages
const ageError = document.getElementById("ageError");
const emailError = document.getElementById("emailError");

// --- Tab switching functions ---
loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);

function showLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
}

function showSignup() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
}

// --- Signup ---
signupBtn.addEventListener("click", signup);

async function signup() {
    const ageVal = age.value.trim();
    const emailVal = email.value.trim();
    const firstNameVal = firstName.value.trim();
    const lastNameVal = lastName.value.trim();
    const passwordVal = password.value.trim();

    ageError.innerHTML = "";
    emailError.innerHTML = "";

    const ageRegex = /^[1-9][0-9]?$|^100$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;

    if (!ageRegex.test(ageVal)) {
        ageError.innerHTML = "Enter a valid age (1-100)";
        valid = false;
    }

    if (!emailRegex.test(emailVal)) {
        emailError.innerHTML = "Enter a valid email";
        valid = false;
    }

    if (!firstNameVal || !lastNameVal || !passwordVal) {
        alert("Please fill all fields");
        valid = false;
    }

    if (valid) {
        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstNameVal,
                    lastName: lastNameVal,
                    email: emailVal,
                    password: passwordVal,
                    age: ageVal
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account Created Successfully!");
                // Clear form
                firstName.value = '';
                lastName.value = '';
                age.value = '';
                email.value = '';
                password.value = '';
                // Switch to login tab
                showLogin();
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert("Connection error. Please make sure the server is running!");
        }
    }
}

// --- Login ---
loginBtn.addEventListener("click", login);

async function login() {
    const emailVal = loginEmail.value.trim();
    const passVal = loginPassword.value.trim();

    if (emailVal === "" || passVal === "") {
        alert("Enter email and password");
        return;
    }

    try {
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailVal,
                password: passVal
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login Successful!");
            // Store user info in sessionStorage
            sessionStorage.setItem('userId', data.userId);
            sessionStorage.setItem('userName', data.firstName);
            sessionStorage.setItem('userEmail', data.email);
            // Redirect to home
            window.location.href = "main.html";
        } else {
            alert(data.message || "Invalid email or password");
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("Connection error. Please make sure the server is running!");
    }
}
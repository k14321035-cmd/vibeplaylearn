import { getToken, logout } from "../scripts/core/auth.js";
import { API_BASE_URL } from "./config.js";

// DOM Elements
const themeSelect = document.getElementById("themeSelect");
const usernameInput = document.getElementById("set-username");
const emailInput = document.getElementById("set-email");
const logoutBtn = document.getElementById("logoutBtn");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

/* ===========================
   1. THEME ENGINE
   =========================== */
function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
    } else if (theme === "dark") {
        document.body.classList.remove("light");
    } else {
        // System preference
        document.body.classList.toggle("light", !prefersDark.matches);
    }
}

// Initialize Theme
const savedTheme = localStorage.getItem("theme") || "system";
themeSelect.value = savedTheme;
applyTheme(savedTheme);

themeSelect.addEventListener("change", () => {
    localStorage.setItem("theme", themeSelect.value);
    applyTheme(themeSelect.value);
});

/* ===========================
   2. LOAD USER DATA
   =========================== */
async function loadUserSettings() {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Unauthorized");

        const user = await res.json();
        
        // Fill the inputs
        usernameInput.value = user.username;
        emailInput.value = user.email;
    } catch (err) {
        console.error("Settings load failed:", err);
        // If unauthorized, send to login
        // window.location.href = "login.html";
    }
}

/* ===========================
   3. LOGOUT LOGIC
   =========================== */
logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        // Clear token from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html"; 
    }
});

// Initialize
loadUserSettings();
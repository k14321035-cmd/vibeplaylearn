/* =========================
   DOM REFERENCES
   ========================= */

import { login } from "../../core/auth.js";







const loginForm  = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const tabs       = document.querySelectorAll(".tab");
const panelsWrap = document.getElementById("panelsWrap");

/* =========================
   LOGIN FORM (JWT AUTH)
   ========================= */

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput    = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const btn           = loginForm.querySelector(".btn-primary");

    // ---- reset UI ----
    clearErr("loginEmailErr");
    clearErr("loginPasswordErr");
    setInputState(emailInput, false);
    setInputState(passwordInput, false);

    let valid = true;

    if (!emailInput.value.trim()) {
      showErr("loginEmailErr", "Email is required");
      setInputState(emailInput, true);
      valid = false;
    } else if (!validateEmail(emailInput.value)) {
      showErr("loginEmailErr", "Enter a valid email");
      setInputState(emailInput, true);
      valid = false;
    }

    if (!passwordInput.value) {
      showErr("loginPasswordErr", "Password is required");
      setInputState(passwordInput, true);
      valid = false;
    }

    if (!valid) return;

    btn.classList.add("loading");

    try {
      await login({
        email: emailInput.value.trim(),
        password: passwordInput.value
      });

      // ✅ REDIRECT
      window.location.replace("/frontend/pages/vibe.html");

    } catch (err) {
      // If the error message is a JSON string (from some potential server responses), parse it
      let msg = err.message;
      try {
           const parsed = JSON.parse(msg);
           if (parsed && parsed.message) msg = parsed.message;
      } catch (e) {}
      
      showErr("loginPasswordErr", msg); // Show general error under password or generic alert
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });
}

/* =========================
   TAB SWITCHING
   ========================= */

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("tab--active"));
    tab.classList.add("tab--active");

    if (tab.dataset.tab === "signup") {
      panelsWrap.classList.add("show-signup");
      document.title = "VIBE – Sign Up";
    } else {
      panelsWrap.classList.remove("show-signup");
      document.title = "VIBE – Login";
    }
  });
});

/* =========================
   PASSWORD VISIBILITY
   ========================= */

document.querySelectorAll(".toggle-pw").forEach(btn => {
  btn.addEventListener("click", () => {
    const input  = document.getElementById(btn.dataset.target);
    const eyeOn  = btn.querySelector(".eye-open");
    const eyeOff = btn.querySelector(".eye-off");

    const show = input.type === "password";
    input.type = show ? "text" : "password";
    eyeOn.style.display  = show ? "none" : "block";
    eyeOff.style.display = show ? "block" : "none";
  });
});

/* =========================
   PASSWORD STRENGTH
   ========================= */

function checkStrength(val) {
  const bar   = document.getElementById("strengthBar");
  const label = document.getElementById("strengthLabel");

  if (!bar || !label) return;

  bar.className   = "strength-bar";
  label.className = "strength-label";

  if (!val) return;

  let score = 0;
  if (val.length >= 8) score++;
  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = ["", "weak", "fair", "good", "strong"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  bar.classList.add(levels[score]);
  label.classList.add(levels[score]);
  label.textContent = labels[score];
}

/* =========================
   VALIDATION HELPERS
   ========================= */

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErr(id) {
  showErr(id, "");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setInputState(input, hasError) {
  if (input) input.classList.toggle("error", hasError);
}


import { signup } from "../../core/auth.js";

const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Grab the button to show loading state
    const btn = signupForm.querySelector(".btn-primary");
    btn.classList.add("loading");

    try {
      const data = {
        fullName: document.getElementById("signupName").value.trim(),
        username: document.getElementById("signupUsername").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value
      };
     console.log("Payload being sent:", data);
      await signup(data);

      alert("Account created! Please log in.");
      // Switch back to login tab
      document.querySelector('[data-tab="login"]').click(); 
      
    } catch (err) {
      alert(err.message || "Signup failed");
    } finally {
      btn.classList.remove("loading");
    }
  });
}
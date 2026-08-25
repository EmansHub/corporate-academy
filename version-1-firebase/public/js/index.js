import { signInAdmin } from "./auth.js";

const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

loginBtn.addEventListener("click", async () => {
  loginError.textContent = "";

  try {
    await signInAdmin();

    // successful login
    window.location.href = "admin.html";

  } catch (e) {
    loginError.textContent = e.message;
  }
});
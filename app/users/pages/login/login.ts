import { UserService } from "../../service/user.service.js";

const userService = new UserService();
const loginLink = document.querySelector("#login") as HTMLElement;
const logoutLink = document.querySelector("#logout") as HTMLElement;
const submitButton = document.querySelector("#submit") as HTMLElement;

function setUserLoginState(isLoggedIn: boolean) {
  if (isLoggedIn) {
    loginLink.style.display = "none";
    logoutLink.style.display = "block";
  } else {
    loginLink.style.display = "block";
    logoutLink.style.display = "none";
  }
}

function handleLogin(event: Event) {

  event.preventDefault();
  const form = document.querySelector("form") as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  userService
    .login(username, password)
    .then((user) => {
      localStorage.setItem("user", JSON.stringify(user));
      setUserLoginState(true);
      userService.redirect(user);
    })
    .catch((error) => {
      console.error("Login failed", error.message);
    });
}

function handleLogout() {
  localStorage.removeItem("user");
  setUserLoginState(false);
}

function checkLoginStatus() {
  const userJSON = localStorage.getItem("user");
  const user = JSON.parse(userJSON)
  if (user) {
    setUserLoginState(true);
    userService.redirect(user);
  } else {
    setUserLoginState(false);
  }
}


if (submitButton) {
  submitButton.addEventListener("click", handleLogin);
}

const logoutElement = document.querySelector("#logout");
if (logoutElement) {
  logoutElement.addEventListener("click", handleLogout);
}

checkLoginStatus();

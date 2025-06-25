import { UserService } from "./users/service/user.service.js";

const userService = new UserService
const loginLink = document.querySelector('#login') as HTMLElement;
const logoutLink = document.querySelector('#logout') as HTMLElement;

function setUserLoginState(isLoggedIn: boolean) {
    if (isLoggedIn) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
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
  } else {
    setUserLoginState(false);
  }
   userService.redirect(user);
}

const logoutElement = document.querySelector('#logout');
if (logoutElement) {
    logoutElement.addEventListener('click', handleLogout);
}

document.addEventListener('DOMContentLoaded', ()=>{
checkLoginStatus();
})


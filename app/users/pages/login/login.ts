import { AuthService } from "../../service/auth.service.js";
import { UserService } from "../../service/user.service.js";

const userService = new UserService();
const authService = new AuthService();
const submitButton = document.querySelector("#submit") as HTMLElement;


function handleLogin(event: Event) {
  event.preventDefault();
  const form = document.querySelector("form") as HTMLFormElement;
  const formData = new FormData(form);
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  userService
    .login(username, password)
    .then((user) => {
      authService.setLoginUser(user);
      authService.redirectUser(user);
    })
    .catch((error) => {
      console.error("Login failed", error.message);
    });
}
if (submitButton) {
  submitButton.addEventListener("click", handleLogin);
}



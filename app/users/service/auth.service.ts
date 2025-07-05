import { User } from "../model/user.model";

const loginLink = document.querySelector('#login') as HTMLElement;
const logoutLink = document.querySelector('#logout') as HTMLElement;

export class AuthService{

  
  //Main redirect based on role
  redirectUser(user?: User): void {
    if (user) {
      if (user.role === "vlasnik") {
        window.location.href = `/app/restaurants/pages/restaurants/restaurants.html`;
      } else if (user.role === "vodic") {
        window.location.href = "/app/tours/pages/userTours/userTours.html";
      } else if (user.role === "turista") {
        window.location.href = "#";
      } else {
        window.location.href = "/app/users/pages/login/login.html";
      }
    }
  }
  //Login
  setLoginUser(user:User):boolean{
    if(user){
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    }
    return false;
  }
  //Logout
  handleLogout() {
    this.unsetLoginUser()
    this.setUserLoginState(false);
    
  }

  unsetLoginUser(): void{
    if(localStorage.getItem("user")){
      localStorage.removeItem("user");
    }
    return;
  }
  //Check login status, call user on every user dependant page
  checkLoginStatus():boolean {
    if(localStorage.getItem("user")){
      const user = JSON.parse(localStorage.getItem("user"))
      if (user) {
        this.setUserLoginState(true);
      } else {
        this.setUserLoginState(false);
      }
      return true;
    }else{
      this.redirectUser();
    }
  }
  //Set link login appearance
  setUserLoginState(isLoggedIn: boolean) {
      if (isLoggedIn) {
          loginLink.style.display = 'none';
          logoutLink.style.display = 'block';
      } else {
          loginLink.style.display = 'block';
          logoutLink.style.display = 'none';
      }
  }
  getUserId():number{
    if(localStorage.getItem("user")){
      const user = JSON.parse(localStorage.getItem("user"));
      return user.id;
    }
    else{
      return 0;
    }
  }
  loginHandler() {
    if (this.checkLoginStatus()) {  // <-- call the function and check return value
      const logoutElement = document.querySelector('#logout');
      const logoutLink = document.querySelector('#logout a');
      if (logoutElement && logoutLink) {
        logoutElement.addEventListener('click', (event) => {
          event.preventDefault();
          this.handleLogout();
          setTimeout(() => {
            window.location.href = logoutLink.getAttribute('href')!;
          }, 100);
        });
      }
    }
  }
}

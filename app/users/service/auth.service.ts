
export class AuthService{
    redirect(user?: User): void {
    if (user) {
      if (user.role === "vlasnik") {
        window.location.href = `/app/restaurants/pages/restaurants/restaurants.html?ownerId=${user.id}`;
      } else if (user.role === "vodic") {
        window.location.href = "/app/tours/pages/userTours/userTours.html";
      } else if (user.role === "turista") {
        window.location.href = "#";
      } else {
        window.location.href = "/app/users/pages/login/login.html";
      }
    }
  }
}

import { User } from "../model/user.model";

export class UserService {
  private apiUrl: string;
  constructor() {
    this.apiUrl = "http://localhost:48696/api/users";
  }


  login(username: string, password: string): Promise<User> {
    const url = `${this.apiUrl}/login`;

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text);
          });
        }
        return response.json();
      })
      .then((user: User) => {
        return user;
      })
      .catch((error) => {
        console.error("Login error:", error.message);
        throw error;
      });
  }
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
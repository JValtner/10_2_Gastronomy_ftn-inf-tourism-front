import { Restaurant } from "../model/restaurant.model.js";

export class RestaurantService {
  private apiURL: string;

  constructor() {
    this.apiURL = "http://localhost:48696/api/restaurants";
  }

  getAll(ownerId: string | null): Promise<Restaurant[]> {
    return fetch(`${this.apiURL}?ownerId=${ownerId}`)
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .then((data) => {
        if (ownerId) {
          // API vraca niz restorana direktno ako je ownerId prosledjen
          return data as Restaurant[];
        } else {
          // API vraca objekat sa poljem Data ako nema ownerId
          return data.Data as Restaurant[];
        }
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  getById(restaurantId: string): Promise<Restaurant> {
    return fetch(`${this.apiURL}/${restaurantId}`)
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .then((restaurants: Restaurant) => {
        return restaurants;
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  add(formData: Restaurant): Promise<Restaurant> {
    return fetch(this.apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .then((restaurant: Restaurant) => {
        return restaurant;
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  update(id: string, formData: Restaurant): Promise<Restaurant> {
    return fetch(`${this.apiURL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .then((restaurant: Restaurant) => {
        return restaurant;
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  delete(restaurantId: string): Promise<void> {
    return fetch(`${this.apiURL}/${restaurantId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }
}

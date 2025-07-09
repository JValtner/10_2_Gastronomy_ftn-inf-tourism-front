import { RestaurantReservation } from "../model/restaurantReservation.model.js";

export class RestaurantReservationService {
  private apiURL: string;

  constructor() {
    this.apiURL = "http://localhost:48696/api/reservations";
  }

  getAll(userId: string): Promise<RestaurantReservation[]> {
    return fetch(`${this.apiURL}/user/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  create(
    newReservation: RestaurantReservation
  ): Promise<RestaurantReservation> {
    return fetch(this.apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReservation),
    })
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }

  cancel(reservationId: string): Promise<RestaurantReservation> {
    return fetch(`${this.apiURL}/${reservationId}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw { status: response.status, message: response.text };
        }
        return response.json();
      })
      .catch((error) => {
        console.error(`Error:`, error.status);
        throw error;
      });
  }
}

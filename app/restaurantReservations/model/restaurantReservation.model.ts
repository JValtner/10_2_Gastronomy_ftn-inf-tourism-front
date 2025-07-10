import { Restaurant } from "../../restaurants/model/restaurant.model.js";
import { User } from "../../users/model/user.model.js";

export interface RestaurantReservation {
  id?: string;
  restaurantId: string;
  userId: string;
  reservationDate: string;
  mealType: "dorucak" | "rucak" | "vecera";
  numberOfGuests: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: string;
  restaurant?: Restaurant;
  user?: User;
}

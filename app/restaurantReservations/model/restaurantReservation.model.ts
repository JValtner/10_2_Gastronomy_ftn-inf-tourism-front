export interface RestaurantReservation {
  id?: number;
  restaurantId: number;
  userId: number;
  reservationDate: Date;
  mealType: "dorucak" | "rucak" | "vecera";
  numberOfGuests: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt?: Date;
  restaurant?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    username: string;
  };
}

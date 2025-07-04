export interface Meal {
  id?: number;
  order: number;
  name: string;
  price: number;
  ingredients: string;
  imageUrl?: string;
  restaurantId: number;
}

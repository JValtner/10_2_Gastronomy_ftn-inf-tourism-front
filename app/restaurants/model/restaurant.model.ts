import { User } from "../../users/model/user.model.js";
import { Meal } from "./meal.model.js";

export interface Restaurant {
  id?: number;
  name: string;
  description: string;
  capacity: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
  status: string;
  owner?: User;
  ownerId: number;
  meals: Meal[];
}

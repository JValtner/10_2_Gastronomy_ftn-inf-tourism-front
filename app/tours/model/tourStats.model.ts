import { Tour } from "./tour.model.js";

export interface TourStats{
   
    tourMaxRes: Tour[],
    tourMinRes: Tour[],
    tourMaxPercentage: Tour[],
    tourMinPercentage: Tour[],
    totalTours: number,
}


import { Keypoint } from "../../keypoints/model/keypoint.model.js";
import { User } from "../../users/model/user.model.js";
import { TourFeedbacks } from "./tourFeedbacks.model.js";
import { TourReservations } from "../../tourReservations/model/tourReservations.model.js";

export interface Tour{
    id?: number;
    name: string;
    description: string;
    dateTime: string;
    maxGuests: number;
    status?: string;
    guide?: User;
    guideId: number;
    keyPoints?: Keypoint[];
    tourFeedbacks?:TourFeedbacks[];
    tourReservations?:TourReservations[];
}


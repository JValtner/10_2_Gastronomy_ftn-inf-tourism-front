import { Keypoint } from "../../keypoints/model/keypoint.model.js";
import { User } from "../../users/model/user.model.js";

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
}


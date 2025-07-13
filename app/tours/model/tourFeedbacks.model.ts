export interface TourFeedbacks{
    id?: number;
    touId: number;
    userId: number;
    userRating?: number;
    userComment?: string;
    postedOn: string;
}

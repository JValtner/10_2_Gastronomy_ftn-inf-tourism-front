export interface TourFeedbacks{
    id?: number;
    tourId: number;
    userId: number;
    userRating?: number;
    userComment?: string;
    postedOn: string;
}
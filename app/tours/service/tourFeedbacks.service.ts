import { TourFeedbacks } from "../model/tourFeedbacks.model";

export class FeedbacksServis {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:48696/api/tour-feedbacks';
    }

    
    getByUser(userId: number): Promise<TourFeedbacks[]> {
    return fetch(`${this.apiUrl}/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch feedbacks. Status: ${response.status}`);
            }
            return response.json();
        })
        .then((tourFeedbacks: TourFeedbacks[]) => {
            return tourFeedbacks;
        })
        .catch(error => {
            console.error("Error fetching feedbacks for user:", error.message || error);
            throw error;
        });
    }

    addNew(formData: TourFeedbacks): Promise<TourFeedbacks> {
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    // Throw a standard Error with the backend message
                    throw new Error(errorMessage || 'Došlo je do greške prilikom ocenjivanja.');
                });
            }
            return response.json();
        })
    }
}



export class TourKeypointService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:48696/api/tours';
    }

    
    addKeypointToTour(tourId: number, keyPointId: number): Promise<string> {
        const url = `${this.apiUrl}/${tourId}/key-points/${keyPointId}`;
        return fetch(url, {
            method: 'POST'
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(message => {
                        throw { status: response.status, message };
                    });
                }
                return response.text(); // assuming response is a simple success message
            })
            .catch(error => {
                console.error(`Error [${error.status}]: ${error.message}`);
                throw error;
            });
    }

    
    removeKeypointFromTour(tourId: number, keyPointId: number): Promise<void> {
        const url = `${this.apiUrl}/${tourId}/key-points/${keyPointId}`;
        return fetch(url, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(message => {
                        throw { status: response.status, message };
                    });
                }
                return; // 204 No Content
            })
            .catch(error => {
                console.error(`Error [${error.status}]: ${error.message}`);
                throw error;
            });
    }
}

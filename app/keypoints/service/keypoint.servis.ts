import { Tour } from "../../tours/model/tour.model.js";
import { User } from "../../users/model/user.model.js";
import { Keypoint } from "../model/keypoint.model.js";
import { TourService } from "../../tours/service/tour.service.js";

const tourService = new TourService();


export class KeypointServis {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:48696/api/key-points';
    }

    getAll(): Promise<Keypoint[]> {
        return fetch(this.apiUrl)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((response: Keypoint[]) => response)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }
    getByUser(user: User): Promise<Keypoint[]> {
    return tourService.getById(user.id.toString())
        .then((tour: Tour) => {
            if (!tour || !tour.keyPoints) {
                throw { status: 404, message: "Tour or keypoints not found." };
            }
            return tour.keyPoints;
        })
        .catch(error => {
            console.error("Error fetching keypoints for user:", error.message || error);
            throw error;
        });
}


    addNew(formData: Keypoint): Promise<Keypoint> {
        return fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((keypoint: Keypoint) => keypoint)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }


    delete(id: string): Promise<void> {
        return fetch(`${this.apiUrl}/${id}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                // Handle no-content responses
                const contentLength = response.headers.get('content-length');
                if (response.status === 204 || contentLength === '0') {
                    return;
                }
                return response.json(); // Optional if backend returns something
            })
            .catch(error => {
                const status = error.status ?? 'Network';
                const message = error.message ?? error.toString();
                console.error(`Error [${status}]: ${message}`);
                throw { status, message };
            });
    }
    getwelcome(){
        const username = document.querySelector('.main-welcome h3') as HTMLElement
  username.textContent = "Dobrodosao: " + this.getName()
    }
    getName(): string{
        return localStorage.getItem("username") || " Guest"
  
}
}

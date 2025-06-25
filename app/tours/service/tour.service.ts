import { Tour } from "../model/tour.model.js";
import { TourResponse } from "../model/tourResponse.model.js";

export class TourService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:48696/api/tours';
    }

    getAll(userId: number | null): Promise<TourResponse> {
        return fetch(`${this.apiUrl}?guideId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((response: TourResponse) => response)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }

    getById(id: string): Promise<Tour> {
        return fetch(`${this.apiUrl}/${id}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((tour: Tour) => tour)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }

    addNew(formData: Tour): Promise<Tour> {
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
            .then((tour: Tour) => tour)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }

    update(id: string, formData: Tour): Promise<Tour> {
        return fetch(`${this.apiUrl}/${id}`, {
            method: 'PUT',
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
            .then((tour: Tour) => tour)
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
        const userJSON = localStorage.getItem("user");
        const user = JSON.parse(userJSON)
        return user.username || " Guest"
  
}
}

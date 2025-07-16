import { TourReservations } from "../model/tourReservations.model.js";



export class ReservationsServis {
    private apiUrl: string;

    constructor() {
        this.apiUrl = 'http://localhost:48696/api/tour-reservations';
    }

    getAll(): Promise<TourReservations[]> {
        return fetch(this.apiUrl)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((response: TourReservations[]) => response)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }
   getByUser(userId: number): Promise<TourReservations[]> {
    return fetch(`${this.apiUrl}/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch reservations. Status: ${response.status}`);
            }
            return response.json();
        })
        .then((reservations: TourReservations[]) => {
            return reservations;
        })
        .catch(error => {
            console.error("Error fetching reservations for user:", error.message || error);
            throw error;
        });
}

    

    getById(id: string): Promise<TourReservations> {
        return fetch(`${this.apiUrl}/${id}`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(errorMessage => {
                        throw { status: response.status, message: errorMessage };
                    });
                }
                return response.json();
            })
            .then((tourReservation: TourReservations) => tourReservation)
            .catch(error => {
                console.error('Error:', error.status);
                throw error;
            });
    }


    addNew(formData: TourReservations): Promise<TourReservations> {
    return fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(errorMessage => {
                // Throw a standard Error with the backend message
                throw new Error(errorMessage || 'Došlo je do greške prilikom rezervacije.');
            });
        }
        return response.json();
    })
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

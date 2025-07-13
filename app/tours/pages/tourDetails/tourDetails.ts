import { Tour } from "../../model/tour.model.js";
import { TourService } from "../../service/tour.service.js";

const tourService = new TourService();

const container = document.querySelector('.tour-details-container') as HTMLElement;

function renderTourData(tourId: string): void {
    tourService.getById(tourId)
        .then((response: Tour) => {
            
            if (!container) {
                console.error('Container not found');
                return;
            }

            container.innerHTML = '';
            
            // -------- Tour Info --------
            const tourInfoSection = document.createElement('div');
            tourInfoSection.innerHTML = `
                <section class="tour-title-section">
                    <h1 class="tour-title">${response.name}</h1>
                    <!-- Reserve Button -->
                    <div class="reserve-btn-wrapper">   
                        <button class="reserve-btn">Rezervisi</button>
                    </div>
                    <!-- Edit Button -->
                    <div class="edit-btn-wrapper">   
                        <button class="edit-btn">Izmeni Turu</button>
                    </div>
                    <!-- Delete Button -->
                    <div class="delete-btn-wrapper">   
                        <button class="delete-btn">Obrisi Turu</button>
                    </div>
                </section>

                <section class="tour-images-section">
                    <div class="tour-images">
                        <img src="../../../assets/nopreview.png" alt="Map View" class="map-image">
                        <img src="../../../assets/nopreview.png" alt="Location Image" class="location-image">
                    </div>
                </section>

                <section class="tour-meta-section">
                    <div class="tour-meta">
                        <div class="meta-left">
                            <p><strong>Number of Guests:</strong> ${response.maxGuests}</p>
                            <p><strong>Guide Name:</strong> ${response.guide?.username ?? 'Unknown'}</p>
                        </div>
                        <div class="meta-right">
                            <p><strong>Status:</strong> ${response.status}</p>
                            <p><strong>Date and Time:</strong> ${formatDate(response.dateTime)}</p>
                        </div>
                    </div>
                </section>

                <section class="tour-description-section">
                    <h2>Description</h2>
                    <p>${response.description}</p>
                </section>
            `
            
            container.appendChild(tourInfoSection);
            //-------- role edit/reserve btn swith --------

            const reserveBtn = container.querySelector('.reserve-btn-wrapper') as HTMLElement;
            const editBtn = container.querySelector('.edit-btn-wrapper') as HTMLElement;
            const deleteBtn = container.querySelector('.delete-btn-wrapper') as HTMLElement;
            const role = localStorage.getItem("role");
            
            if (role === "turista") {
                editBtn.style.display = "none";
                deleteBtn.style.display="none"
            } else if (role === "vodic") {
                reserveBtn.style.display = "none";

                //Edit Btn event listener
                editBtn.onclick = () => {
                    event.stopPropagation();
                    window.location.href = `../tourForm/tourForm.html?id=${response.id}`;
                };

                //Delete Btn event listener
                deleteBtn.onclick = () => {
                    alert("Dali ste sigurni da zelite da obrisete turu?")
                    event.stopPropagation();
                    tourService.delete(response.id.toString())
                    .catch(error => console.error(error.status, error.text));
                };
            } else {
                container.innerHTML = "<p>Korisnik nedefinisan. Molimo vas da se ulogujete.</p>";
                return;
            }

            // -------- Key Points --------
            const keypointSection = document.createElement('section');
            keypointSection.classList.add('keypoints-section');
            keypointSection.innerHTML = `<h2>Key Points in Tour</h2>`;

            const keypoints = Array.isArray(response.keyPoints) ? response.keyPoints : [];

            if (keypoints.length === 0) {
                const noKP = document.createElement('p');
                noKP.textContent = 'No keypoints to show';
                keypointSection.appendChild(noKP);
            } else {
                for (const kp of keypoints) {
                    const kpBlock = document.createElement('div');
                    kpBlock.classList.add('keypoint');
                    kpBlock.innerHTML = `
                        <div class="keypoint-desc">
                        <p><strong>Name:</strong> ${kp.name}</p>
                        <p><strong>Latitude:</strong> ${kp.latitude}</p>
                        <p><strong>Longitude:</strong> ${kp.longitude}</p>
                        <p><strong>Description:</strong> ${trimText(kp.description)}</p>
                        </div>
                        <div class="keypoint-img">
                        <img src="${kp.imageUrl}" alt="Key Point Image" style="max-width:300px;">
                        </div>
                    `;
                    keypointSection.appendChild(kpBlock);
                    //Keypoint block view details Event listener
                    kpBlock.addEventListener("click", ()=>{
                    window.location.href=`../../../keypoints/pages/keypointDetails/keypointDetails.html?keypointId=${kp.id}`;
                    })
                }
            }
            container.appendChild(keypointSection);

            const feedbackSection = document.createElement('section');
            feedbackSection.classList.add('feedbacks-section');
            feedbackSection.innerHTML = `<h2>Feedbacks</h2>`;

            const feedbacks = Array.isArray(response.tourFeedbacks) ? response.tourFeedbacks : [];

            if (feedbacks.length === 0) {
                feedbackSection.innerHTML += `<p>No feedbacks yet.</p>`;
            } else {
                for (const fb of feedbacks) {
                    const fbBlock = document.createElement('div');
                    fbBlock.classList.add('feedback');
                    fbBlock.innerHTML = `
                        <p><strong>Rating:</strong> ${'★'.repeat(fb.userRating)}${'☆'.repeat(5 - fb.userRating)}</p>
                        <p><strong>Comment:</strong> ${fb.userComment}</p>
                        <p><strong>Date:</strong> ${formatDate(fb.postedOn)}</p>
                    `;
                    feedbackSection.appendChild(fbBlock);
                }
            }
            container.appendChild(feedbackSection);

            // -------- Tour Reservations --------
            const reservationSection = document.createElement('section');
            reservationSection.classList.add('reservations-section');
            reservationSection.innerHTML = `<h2>Reservations</h2>`;

            const reservations = Array.isArray(response.tourReservations) ? response.tourReservations : [];

            if (reservations.length === 0) {
                reservationSection.innerHTML += `<p>No reservations yet.</p>`;
            } else {
                for (const res of reservations) {
                    const resBlock = document.createElement('div');
                    resBlock.classList.add('reservation');
                    resBlock.innerHTML = `
                        <p><strong>User ID:</strong> ${res.userId}</p>
                        <p><strong>Number of Guests:</strong> ${res.numberOfGuests}</p>
                    `;
                    reservationSection.appendChild(resBlock);
                }
            }
            container.appendChild(reservationSection);  
        })
        .catch(error => {
            console.error(error.status, error.message);
        });
        
}

function trimText(text: string, maxLength: number = 250): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}  ${hours}:${minutes}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const tourId = urlparams.get('tourId');
    renderTourData(tourId);
});

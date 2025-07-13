
import { Keypoint } from "../../model/keypoint.model.js";
import { KeypointServis } from "../../service/keypoint.servis.js";

const keypointService = new KeypointServis();

function renderKeypointData(keypointId: string): void {
    keypointService.getById(keypointId)
        .then((response: Keypoint) => {
            const container = document.querySelector('.keypoint-details-container') as HTMLElement;
            if (!container) {
                console.error('Container not found');
                return;
            }

            container.innerHTML = '';

            const keypointInfoSection = document.createElement('div');
            keypointInfoSection.innerHTML = `
                <section class="tour-title-section">
                    <h1 class="tour-title">${response.name}</h1>
                    <!-- Delete Button -->
                    <div class="delete-btn-wrapper">   
                        <button class="delete-btn">Obrisi Turu</button>
                    </div>
                </section>

                <section class="tour-images-section">
                    <div class="tour-images">
                        <img src="${response.imageUrl || '../../../assets/nopreview.png'}" alt="Keypoint Image" class="location-image">
                        <img src="../../../assets/nopreview.png" alt="Map Placeholder" class="map-image">
                    </div>
                </section>

                <section class="tour-meta-section">
                    <div class="tour-meta">
                        <div class="meta-left">
                            <p><strong>Latitude:</strong> ${response.latitude}</p>
                            <p><strong>Order:</strong> ${response.order ?? 'N/A'}</p>
                        </div>
                        <div class="meta-right">
                            <p><strong>Longitude:</strong> ${response.longitude}</p>
                        </div>
                    </div>
                </section>

                <section class="tour-description-section">
                    <h2>Description</h2>
                    <p>${response.description}</p>
                </section>
            `;

            container.appendChild(keypointInfoSection);

            //-------- role edit/delete btn swith --------
            const deleteBtn = container.querySelector('.delete-btn-wrapper') as HTMLElement;
            const role = localStorage.getItem("role");
            
            if (role === "turista") {
                deleteBtn.style.display="none"
            } else if (role === "vodic") {
                

                //DeleteBtn event listener
                deleteBtn.onclick = () => {
                    alert("Dali ste sigurni da zelite da obrisete turu?")
                    event.stopPropagation();
                    keypointService.delete(response.id.toString())
                    .catch(error => console.error(error.status, error.text));
                };
            } else {
                container.innerHTML = "<p>Korisnik nedefinisan. Molimo vas da se ulogujete.</p>";
                return;
            }
        })
        .catch(error => {
            console.error(error.status, error.message);
        });
}

window.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const keypointId = urlparams.get('keypointId');

    if (keypointId) {
        renderKeypointData(keypointId);
    } else {
        console.warn('No keypointId provided in URL');
    }
});

import { KeypointServis } from "../../../keypoints/service/keypoint.servis.js";
import { Tour } from "../../model/tour.model.js";
import { TourService } from "../../service/tour.service.js";
import { TourKeypointService } from "../../service/tourKeypoint.service.js";

const tourService = new TourService();
const keypointService = new KeypointServis();
const tourKeypointService = new TourKeypointService();

const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const tourId = urlparams.get('tourId');

function renderAllKeypointData(): void {
    if (tourId === null) {
        console.error('no tour selected');
        return;
    }

    tourService.getById(tourId).then(responseTour => {
        const existingKeypointIds = new Set(responseTour.keyPoints.map(kp => kp.id));

        keypointService.getAll().then(allKeypoints => {
            const table = document.querySelector('#all-keypoints table tbody');
            if (!table) {
                console.error('No data to show');
                return;
            }
            table.innerHTML = '';

            for (const keypoint of allKeypoints) {
                const newRow = document.createElement('tr');

                const cell1 = document.createElement('td');
                cell1.textContent = keypoint.name.toString();
                newRow.appendChild(cell1);

                const cell2 = document.createElement('td');
                const addBtn = document.createElement('button');
                addBtn.textContent = 'Add';
                addBtn.style.width = 'auto';

                if (existingKeypointIds.has(keypoint.id)) {
                    addBtn.disabled = true;
                    addBtn.style.background = "grey";
                    addBtn.style.cursor = "not-allowed";
                } else {
                    addBtn.onclick = () => {
                        tourKeypointService.addKeypointToTour(parseInt(tourId), keypoint.id)
                            .then(() => {
                                addBtn.disabled = true;
                                addBtn.style.background = "grey";
                                addBtn.style.cursor = "not-allowed";
                                location.reload()
                            })
                            .catch(error => {
                                console.error(error.status, error.text);
                            });
                    };
                }

                cell2.appendChild(addBtn);
                newRow.appendChild(cell2);
                table.appendChild(newRow);
            }
        }).catch(error => {
            console.error('Failed to get keypoints:', error);
        });
    }).catch(error => {
        console.error('Failed to get tour:', error);
    });
}


function renderTourKeypointData(): void {
    tourService.getById(tourId)
        .then((response: Tour) => {
            const table = document.querySelector('#tour-keypoints table tbody');
            if (!table) {
                console.error('Table body not found');
                return;
            }

            table.innerHTML = '';

            // Ensure response.keypoints is a valid array or fallback to empty array
            const keypoints = Array.isArray(response.keyPoints) ? response.keyPoints : [];

            if (keypoints.length === 0) {
                const p = document.createElement('p');
                p.textContent = 'No keypoints to show';
                p.style.textAlign = 'center';
                p.style.padding = '1rem';
                const container = document.querySelector('#tour-keypoints');

                if (container) {
                    // Remove existing message if any
                    const oldMsg = container.querySelector('p');
                    if (oldMsg) oldMsg.remove();

                    container.appendChild(p);
                } else {
                    console.warn('Container for keypoints not found');
                }

                return;
            }
            //Check if tour has at least 2 keypoints
            toggleFinish(keypoints.length)

            // Iterate and render keypoints
            for (const keypoint of keypoints) {
                const newRow = document.createElement('tr');

                const cell1 = document.createElement('td');
                cell1.textContent = keypoint.name.toString();
                newRow.appendChild(cell1);

                // Remove Button
                const cell2 = document.createElement('td');
                const RemoveBtn = document.createElement('button');
                RemoveBtn.textContent = 'Remove';
                RemoveBtn.style.width = 'auto';

                RemoveBtn.onclick = function () {
                    tourKeypointService.removeKeypointFromTour(parseInt(tourId), keypoint.id)
                        .then(() => {newRow.remove(); location.reload()})//reload to reset added butons???
                        .catch(error => {
                            console.error(error.status, error.text);
                        });
                };

                cell2.appendChild(RemoveBtn);
                newRow.appendChild(cell2);
                table.appendChild(newRow);
            }
        })
        .catch(error => {
            console.error(error.status, error.message);
        });
}
function toggleFinish(arrsize: number): void {
  const check = document.getElementById("finishTour") as HTMLButtonElement;
  if (arrsize <2) {
    check.disabled = true;
    check.style.backgroundColor = "grey";
    check.style.cursor = "not-allowed";
  } else {
    check.disabled = false;
    check.style.backgroundColor = "";
    check.style.cursor = "pointer";
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderTourKeypointData();
  renderAllKeypointData();
  tourService.getwelcome();
  
});

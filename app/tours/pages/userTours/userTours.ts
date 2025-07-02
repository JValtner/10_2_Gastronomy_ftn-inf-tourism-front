import { TourResponse } from "../../model/tourResponse.model.js";
import { TourService } from "../../service/tour.service.js";

const tourService = new TourService();

function renderData(): void {
  const userId = parseInt(localStorage.getItem("userId") || "0");
  tourService.getAll(userId)
    .then((response: TourResponse) => {
      const container = document.querySelector('.tour-container');
      if (!container) {
        console.error('Tours container not found');
        return;
      }

      container.innerHTML = ''; 

      for (const tour of response.data) {
        const card = document.createElement('div');
        card.className = 'tour-card';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'tour-title';

        const h3 = document.createElement('h3');
        h3.textContent = tour.name;
        titleDiv.appendChild(h3);

        const dateP = document.createElement('p');
        dateP.textContent = `Date: ${formatDate(tour.dateTime)}`;
        titleDiv.appendChild(dateP);

        const guestsP = document.createElement('p');
        guestsP.textContent = `Max guests: ${tour.maxGuests ?? 'N/A'}`;
        titleDiv.appendChild(guestsP);

        card.appendChild(titleDiv);

        const descDiv = document.createElement('div');
        descDiv.className = 'tour-description';
        const descP = document.createElement('p');
        descP.textContent = tour.description;
        descDiv.appendChild(descP);
        card.appendChild(descDiv);

        const imgDiv = document.createElement('div');
        imgDiv.className = 'tour-img';
        const img = document.createElement('img');
        // You didn't specify image URL in your tour data, so let's assume tour.imageUrl or a placeholder
        img.src = '../../../assets/nopreview.png';
        img.alt = tour.name;
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);

        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'tour-actions';

        // Edit Button
        const editButton = document.createElement('button');
        editButton.className = "tour-edit-btn"
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
          window.location.href = `../tourForm/tourForm.html?id=${tour.id}`;
        };
        actionsDiv.appendChild(editButton);

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = "tour-delete-btn";
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
          tourService.delete(tour.id.toString())
            .then(() => {
              card.remove();
            })
            .catch(error => {
              console.error(error.status, error.text);
            });
        };
        actionsDiv.appendChild(deleteButton);

        card.appendChild(actionsDiv);

        container.appendChild(card);
      }
    })
    .catch(error => {
      console.error(error.status, error.message);
    });
}

function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

window.addEventListener('DOMContentLoaded', () => {
  renderData();
  tourService.getwelcome()
  
});

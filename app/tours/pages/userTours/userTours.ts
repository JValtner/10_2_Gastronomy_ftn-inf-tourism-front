import { TourResponse } from "../../model/tourResponse.model.js";
import { TourService } from "../../service/tour.service.js";

const tourService = new TourService();
const userJSON = localStorage.getItem("user");
const user = JSON.parse(userJSON)

function renderData(): void {
  
  tourService.getAll(user.id)
    .then((response: TourResponse) => {   
      const table = document.querySelector('table tbody');
      if (!table) {
        console.error('Table body not found');
        return;
      }

      table.innerHTML = '';

      for (const tour of response.data) {
        console.log(tour)
        const newRow = document.createElement('tr');

        const cell1 = document.createElement('td');
        cell1.textContent = tour.id?.toString();
        newRow.appendChild(cell1);

        const cell2 = document.createElement('td');
        cell2.textContent = tour.name;
        newRow.appendChild(cell2);

        const cell3 = document.createElement('td');
        cell3.textContent = tour.description;
        newRow.appendChild(cell3);

        const cell4 = document.createElement('td');
        cell4.textContent = tour.dateTime;
        newRow.appendChild(cell4);

        const cell5 = document.createElement('td');
        cell5.textContent = tour.maxGuests?.toString();
        newRow.appendChild(cell5);

        const cell6 = document.createElement('td');
        cell6.textContent = tour.status?.toString();
        newRow.appendChild(cell6);

        const cell7 = document.createElement('td');
        cell7.textContent = tour.guide?.username.toString();
        newRow.appendChild(cell7);

        const cell8 = document.createElement('td');
        cell8.textContent = tour.keypoints?.map(k => k.name).join(', ') || 'No keypoints';
        newRow.appendChild(cell8);

        //Edit Button
        const cell9 = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.width = 'auto';

        const tourId = tour.id;
        editButton.onclick = function () {
        window.location.href = `../tourForm/tourForm.html?id=${tourId}`;
        };
        cell9.appendChild(editButton);
        newRow.appendChild(cell9);

        //Delete Button
        const cell10 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.width = 'auto';

        deleteButton.onclick = function(){
        tourService.delete(tourId.toString())
            .then(() => {
            newRow.remove(); 
            })
            .catch(error => {
            console.error(error.status, error.text);
            });
        };
        cell10.appendChild(deleteButton);
        newRow.appendChild(cell10);

        table.appendChild(newRow);
      }
    })
    .catch(error => {
      console.error(error.status, error.message);
    });
}

const logout = document.querySelector('#logout') as HTMLAnchorElement;
logout.addEventListener("click", ()=>{
  localStorage.removeItem("user");
  window.location.href = "../../../users/pages/login/login.html";

})

window.addEventListener('DOMContentLoaded', () => {
  renderData();
  tourService.getwelcome() 
});

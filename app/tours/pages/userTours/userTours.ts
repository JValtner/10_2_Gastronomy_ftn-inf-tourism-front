import { TourService } from "../../service/tour.service.js";
import { TourResponse } from "../../model/tourResponse.model.js";

const tourService = new TourService();

const container = document.querySelector('.tour-container') as HTMLElement;
const paginationBar = document.querySelector('#pagination-bar') as HTMLElement;
const addTourButton = document.querySelector('#addNewTour') as HTMLElement;

let currentPage = 1;
let totalPages = 1;

function getParamsFromUI() {
  const guideId = localStorage.getItem("role") === "vodic"
    ? parseInt(localStorage.getItem("userId") || "0")
    : 0;

  const pageSize = parseInt((document.querySelector("#page-size") as HTMLSelectElement)?.value || "10");
  const orderBy = (document.querySelector("#sort-by") as HTMLSelectElement)?.value || "DateTime";
  const orderDirection = (document.querySelector("#order-by") as HTMLSelectElement)?.value.toUpperCase() || "DESC";

  return { guideId, pageSize, orderBy, orderDirection };
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

function renderTours(tours: TourResponse["data"]) {
  container.innerHTML = "";

  if (!tours.length) {
    container.innerHTML = "<p>Trenutno nema dostupnih tura.</p>";
    return;
  }

  for (const tour of tours) {
    const card = document.createElement('div');
    card.className = 'tour-card';
    //tour details event listener
    card.addEventListener("click", ()=>{
      window.location.href=`../tourDetails/tourDetails.html?tourId=${tour.id}`;
    })

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
    descP.textContent = trimText(tour.description);
    descDiv.appendChild(descP);
    card.appendChild(descDiv);

    const imgDiv = document.createElement('div');
    imgDiv.className = 'tour-img';
    const img = document.createElement('img');
    img.src = '../../../assets/nopreview.png';
    img.alt = tour.name;
    imgDiv.appendChild(img);
    card.appendChild(imgDiv);

    const role = localStorage.getItem("role");
    if (role === "vodic") {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'tour-actions';

      const editButton = document.createElement('button');
      editButton.className = "tour-edit-btn";
      editButton.textContent = 'Edit';
      editButton.onclick = () => {
        event.stopPropagation();
        window.location.href = `../tourForm/tourForm.html?id=${tour.id}`;
      };
      actionsDiv.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.className = "tour-delete-btn";
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = () => {
        alert("Dali ste sigurni da zelite da obrisete turu?")
        event.stopPropagation();
        tourService.delete(tour.id.toString())
          .then(() => card.remove())
          .catch(error => console.error(error.status, error.text));
      };
      actionsDiv.appendChild(deleteButton);

      card.appendChild(actionsDiv);
    }

    container.appendChild(card);
  }
}

function updatePaginationDisplay() {
  (document.querySelector("#current-page") as HTMLElement).textContent = currentPage.toString();
  (document.querySelector("#total-pages") as HTMLElement).textContent = totalPages.toString();

  const prevBtn = document.querySelector("#prev-page") as HTMLButtonElement;
  const nextBtn = document.querySelector("#next-page") as HTMLButtonElement;

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function loadData() {
  const { guideId, pageSize, orderBy, orderDirection } = getParamsFromUI();

  tourService.getPaged(guideId, currentPage, pageSize, orderBy, orderDirection)
    .then((response: TourResponse) => {
      renderTours(response.data);
      totalPages = Math.ceil(response.totalCount / pageSize);
      updatePaginationDisplay();
    })
    .catch(error => {
      container.innerHTML = "<p>Greška pri učitavanju tura.</p>";
      console.error(error.status, error.message);
    });
}

function attachPaginationEvents() {
  const prevBtn = document.querySelector("#prev-page") as HTMLButtonElement;
  const nextBtn = document.querySelector("#next-page") as HTMLButtonElement;
  const pageSizeSelect = document.querySelector("#page-size") as HTMLSelectElement;
  const sortBySelect = document.querySelector("#sort-by") as HTMLSelectElement;
  const orderSelect = document.querySelector("#order-by") as HTMLSelectElement;

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadData();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadData();
    }
  });

  pageSizeSelect.addEventListener("change", () => {
    currentPage = 1;
    loadData();
  });

  sortBySelect.addEventListener("change", () => {
    currentPage = 1;
    loadData();
  });

  orderSelect.addEventListener("change", () => {
    currentPage = 1;
    loadData();
  });
}
function trimText(text: string, maxLength: number = 250): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

window.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem("role");

  if (role === "turista") {
    addTourButton.style.display = "none";
    paginationBar.style.display = "block";
  } else if (role === "vodic") {
    addTourButton.style.display = "inline-block";
  } else {
    container.innerHTML = "<p>Korisnik nedefinisan. Molimo vas da se ulogujete.</p>";
    return;
  }

  loadData();
  attachPaginationEvents();
  tourService.getwelcome();
});

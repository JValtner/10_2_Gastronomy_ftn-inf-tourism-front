import { TourService } from "../../service/tour.service.js";
import { TourResponse } from "../../model/tourResponse.model.js";
import { TourStats } from "../../model/tourStats.model.js";
import { Keypoint } from "../../../keypoints/model/keypoint.model.js";
import { Tour } from "../../model/tour.model.js";
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Chart: any;

const tourService = new TourService();

const container = document.querySelector('.tour-container') as HTMLElement;
const paginationBar = document.querySelector('#pagination-bar') as HTMLElement;
const addTourButton = document.querySelector('#addNewTour') as HTMLElement;
const statsContainer = document.querySelector(".statistics-display") as HTMLElement;
const statsNav = document.querySelector(".nav-statistics") as HTMLElement;

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

function getStatParamsFromUI() {
  const guideId = localStorage.getItem("role") === "vodic"
    ? parseInt(localStorage.getItem("userId") || "0")
    : 0;

  const startDate = (document.querySelector("#start-date") as HTMLInputElement)?.value;
  const endDate = (document.querySelector("#end-date") as HTMLInputElement)?.value;

  return { guideId, startDate, endDate };
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

    card.addEventListener("click", () => {
      window.location.href = `../tourDetails/tourDetails.html?tourId=${tour.id}`;
    });

    const titleDiv = document.createElement('div');
    titleDiv.className = 'tour-title';

    const h3 = document.createElement('h3');
    h3.textContent = tour.name;
    titleDiv.appendChild(h3);

    const dateP = document.createElement('p')
    const tourDate = new Date(tour.dateTime)

    dateP.textContent = `Date: ${formatDate(tour.dateTime)}`

    // check if the tour is in the past
    if (tourDate.getTime() < Date.now()) {
      dateP.style.color = "red"
      dateP.textContent += " (Završena)"
    }

    titleDiv.appendChild(dateP)

    const reservationsP = document.createElement('p');
    reservationsP.style.color="Green";
    titleDiv.appendChild(reservationsP);

    card.appendChild(titleDiv);

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

    // ✅ Unique map ID
    const mapDiv = document.createElement('div');
    mapDiv.className = 'tour-map';
    mapDiv.id = `map-${tour.id}`;
    card.appendChild(mapDiv);

    // ✅ Fetch tour details and render map inside correct container
    tourService.getById(tour.id.toString())
      .then((response: Tour) => {
        // sum all numberOfGuests from reservations
        const totalBooked = response.tourReservations
        ? response.tourReservations.reduce((sum, r) => sum + r.numberOfGuests, 0)
        : 0;

      reservationsP.textContent = `Booked: ${totalBooked}`;

      // render map
      mapDisplay(response.keyPoints, mapDiv);
      })
      .catch(err => console.error("Map load failed", err));

    const role = localStorage.getItem("role");
    if (role === "vodic") {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'tour-actions';

      const editButton = document.createElement('button');
      editButton.className = "tour-edit-btn";
      editButton.textContent = 'Edit';
      editButton.onclick = (event) => {
        event.stopPropagation();
        window.location.href = `../tourForm/tourForm.html?id=${tour.id}&action=edit`;
      };
      actionsDiv.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.className = "tour-delete-btn";
      deleteButton.textContent = 'Delete';
      deleteButton.onclick = (event) => {
        event.stopPropagation();
        if (confirm("Dali ste sigurni da zelite da obrisete turu?")) {
          tourService.delete(tour.id.toString())
            .then(() => card.remove())
            .catch(error => console.error(error.status, error.text));
        }
      };
      actionsDiv.appendChild(deleteButton);

      const cloneButton = document.createElement('button');
      cloneButton.className = "tour-clone-btn";
      cloneButton.textContent = 'Clone';
      cloneButton.onclick = (event) => {
        event.stopPropagation();
        window.location.href = `../tourForm/tourForm.html?id=${tour.id}&action=clone`;
      };
      actionsDiv.appendChild(cloneButton);

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

function loadStats() {
  const { guideId, startDate, endDate } = getStatParamsFromUI();
  tourService.getStats(guideId, startDate, endDate)
    .then((response: TourStats) => {
      renderStats(response);
    })
    .catch(error => {
      container.innerHTML = "<p>Greška pri učitavanju statistike.</p>";
      console.error(error.status, error.message);
    });
}

function renderStats(stats: TourStats) {
  if (!statsContainer) return;
  // clear previous charts
  statsContainer.innerHTML = `
    <div class="chart"><canvas id="chart1"></canvas></div>
    <div class="chart"><canvas id="chart2"></canvas></div>
    <div class="chart"><canvas id="chart3"></canvas></div>
    <div class="chart"><canvas id="chart4"></canvas></div>
  `;

  // 1️⃣ Top 5 tours with most reservations
  const maxResLabels = stats.tourMaxRes?.map(t => t.name) || [];
  const maxResData = stats.tourMaxRes?.map(t => t.tourReservations?.length || 0) || [];
  renderChart("chart1", maxResLabels, maxResData, "Top 5 - Najviše rezervacija", "Tura", "Broj rezervacija");

  // 2️⃣ Bottom 5 tours with least reservations
  const minResLabels = stats.tourMinRes?.map(t => t.name) || [];
  const minResData = stats.tourMinRes?.map(t => t.tourReservations?.length || 0) || [];
  renderChart("chart2", minResLabels, minResData, "Top 5 - Najmanje rezervacija", "Tura", "Broj rezervacija");

  // 3️⃣ Top 5 tours with highest % fulfilment
const maxPercArray = (stats.tourMaxPercentage || []).map(t => {
  const percentage = t.maxGuests && t.maxGuests > 0
    ? Math.round((t.tourReservations.reduce((sum, r) => sum + r.numberOfGuests, 0)) / t.maxGuests * 100)
    : 0;
  return { name: t.name, value: percentage };
});

// sort descending (highest % first)
maxPercArray.sort((a, b) => b.value - a.value);

const maxPercLabels = maxPercArray.map(t => t.name);
const maxPercData = maxPercArray.map(t => t.value);

renderChart("chart3", maxPercLabels, maxPercData, "Top 5 - Najviši % popunjenosti", "Tura", "% Popunjenosti");


// 4️⃣ Bottom 5 tours with lowest % fulfilment
const minPercArray = (stats.tourMinPercentage || []).map(t => {
  const percentage = t.maxGuests && t.maxGuests > 0
    ? Math.round((t.tourReservations.reduce((sum, r) => sum + r.numberOfGuests, 0)) / t.maxGuests * 100)
    : 0;
  return { name: t.name, value: percentage };
});

// sort ascending (lowest % first)
minPercArray.sort((a, b) => a.value - b.value);

const minPercLabels = minPercArray.map(t => t.name);
const minPercData = minPercArray.map(t => t.value);

renderChart("chart4", minPercLabels, minPercData, "Top 5 - Najniži % popunjenosti", "Tura", "% Popunjenosti");

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

function attachStatEvents() {
  const startDate = document.querySelector("#start-date") as HTMLInputElement;
  const endDate = document.querySelector("#end-date") as HTMLInputElement;

  startDate.addEventListener("change", () => {
    loadStats();
  });

  endDate.addEventListener("change", () => {
    loadStats();
  });
}

function trimText(text: string, maxLength: number = 250): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
function renderChart(
  canvasId: string,
  labels: string[],
  data: number[],
  title: string,
  xLabel: string,
  yLabel: string
) {
  const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        borderWidth: 2,
        borderColor: 'rgba(255, 127, 80, 0.9)', // Coral
        backgroundColor: 'rgba(255, 127, 80, 0.7)', // Semi-transparent Coral
        borderRadius: 8, // rounded corners
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 20
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#333',
            font: { size: 12 }
          },
          title: {
            display: true,
            text: xLabel,
            color: '#222',
            font: { size: 14, weight: 'bold' }
          }
        },
        y: {
          grid: {
            color: 'rgba(0,0,0,0.05)'
          },
          ticks: {
            color: '#333',
            font: { size: 12 }
          },
          title: {
            display: true,
            text: yLabel,
            color: '#222',
            font: { size: 14, weight: 'bold' }
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 18, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
          color: '#222'
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(50,50,50,0.9)',
          titleFont: { weight: 'bold' },
          padding: 10
        }
      }
    }
  });
}

function mapDisplay(keypoints: Keypoint[], mapEl: HTMLElement) {
  if (keypoints.length === 0) return;

  // reset container
  mapEl.innerHTML = "";

  const map = L.map(mapEl, {
    zoomControl: false,      // ❌ remove zoom +/- buttons
    scrollWheelZoom: false,  // ❌ disable scroll zoom
    doubleClickZoom: false,  // ❌ disable double-click zoom
    attributionControl: false // ❌ remove attribution text
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '' // just in case
  }).addTo(map);

  const waypoints = keypoints.map(kp => L.latLng(kp.latitude, kp.longitude));

  // ✅ Always fit to all keypoints
  map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] });

  // Routing control with waypoints
  const control = L.Routing.control({
    waypoints,
    router: L.Routing.osrmv1(),
    lineOptions: { styles: [{ color: 'blue', weight: 4, opacity: 0.7 }] },
    createMarker: (i, wp) =>
      L.marker(wp.latLng).bindPopup(
        `<b>${keypoints[i].name}</b><br>${keypoints[i].description}`
      ),
    show: false,
    addWaypoints: false,
    collapsible: false,
  }).addTo(map);

  // ✅ If routing succeeds, adjust bounds again
  control.on('routesfound', (e) => {
    const route = e.routes[0];
    if (route && route.bounds) {
      map.fitBounds(route.bounds, { padding: [50, 50] });
    }
  });
}
window.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem("role");

  if (role === "turista") {
    addTourButton.style.display = "none";
    paginationBar.style.display = "block";
    statsContainer.style.display = "none";
    statsNav.style.display = "none";
  } else if (role === "vodic") {
    addTourButton.style.display = "inline-block";
    loadStats();
    attachStatEvents();
  } else {
    container.innerHTML = "<p>Korisnik nedefinisan. Molimo vas da se ulogujete.</p>";
    return;
  }

  loadData();
  attachPaginationEvents();
  tourService.getwelcome();
});

import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

const isOwner = localStorage.getItem("role") === "vlasnik";
const ownerId = getOwnerIdFromUrl();
let currentPage = 1;
let pageSize = 5;
let orderBy = "Name";
const orderDirection = "ASC";

// Renders
function renderRestaurants(restaurants: Restaurant[]): void {
  const div = document.querySelector("#restaurants-container");
  if (!div) return;

  if (restaurants.length === 0) {
    div.textContent = "Nemate nijedan restoran.";
    return;
  }

  div.innerHTML = "";

  restaurants.forEach((restaurant) => {
    //Kartica
    const card = document.createElement("div");
    card.className = "restaurant-card";

    // Kartica je dugme
    card.dataset.id = restaurant.id.toString();
    card.addEventListener("click", function () {
      window.location.href = `../restaurantDetails/restaurantDetails.html?id=${restaurant.id}`;
    });

    //Info div
    const info = document.createElement("div");
    info.className = "restaurant-info";

    //Prvo cu prikazati sliku
    const image = document.createElement("img");
    image.src = restaurant.imageUrl;
    image.className = "restaurant-image";
    card.appendChild(image);

    //Zatim naslov
    const name = document.createElement("p");
    name.textContent = restaurant.name;
    name.className = "restaurant-name";
    info.appendChild(name);

    //Opis
    const description = document.createElement("p");
    description.textContent = restaurant.description;
    description.className = "restaurant-description";
    info.appendChild(description);

    //Kapacitet
    const capacity = document.createElement("p");
    capacity.textContent = "Kapacitet: " + restaurant.capacity + " mesta";
    capacity.className = "restaurant-capacity";
    info.appendChild(capacity);

    //Status
    if (ownerId) {
      if (restaurant.status === "u pripremi") {
        card.classList.add("status-preparation");
      } else if (restaurant.status === "objavljeno") {
        card.classList.add("status-published");
      }
    }

    card.appendChild(info);

    //Akcije div
    if (ownerId) {
      const actions = document.createElement("div");
      actions.className = "restaurants-actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Izmeni";
      editBtn.className = "restaurant-button";
      editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        window.location.href = `../restaurantsForm/restaurantsForm.html?id=${restaurant.id}`;
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Obrisi";
      deleteBtn.className = "restaurant-button";
      deleteBtn.id = "deleteBtn";
      deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        restaurantService
          .delete(restaurant.id.toString())
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error(error.status, error.text);
          });
      });
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
      card.appendChild(actions);
    }

    div.appendChild(card);
  });
}

function renderPagination(totalCount: number): void {
  const container = document.querySelector("#pagination-container");
  if (!container) return;

  container.innerHTML = "";

  const totalPages = Math.ceil(totalCount / pageSize);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i.toString();
    btn.classList.add("pagination-button");
    if (i === currentPage) {
      btn.classList.add("active-page");
    }

    btn.addEventListener("click", () => {
      currentPage = i;
      loadAndRenderRestaurants();
    });
    container.appendChild(btn);
  }
}

// Event listeners
window.addEventListener("scroll", () => {
  const stickyDiv = document.querySelector("#restaurants-title-container");
  if (window.scrollY > 100) {
    stickyDiv?.classList.add("scrolled");
  } else {
    stickyDiv?.classList.remove("scrolled");
  }
});

const pageSizeSelect = document.querySelector(
  "#pageSizeSelect"
) as HTMLSelectElement;
pageSizeSelect.addEventListener("change", () => {
  currentPage = 1; // resetuj na prvu stranicu kad se promeni broj po stranici
  pageSize = parseInt(pageSizeSelect.value);
  loadAndRenderRestaurants();
});

const pageSortSelect = document.querySelector(
  "#pageSortSelect"
) as HTMLSelectElement;
pageSortSelect.addEventListener("change", () => {
  orderBy = pageSortSelect.value; // "Name" ili "Capacity" kako si podesio u HTML
  currentPage = 1; // resetuj na prvu stranicu kad se promeni sortiranje
  loadAndRenderRestaurants();
});

// Sakrivanje za suprotnu ulogu
const addBtn = document.querySelector("#addBtn") as HTMLButtonElement;
if (ownerId) {
  addBtn.addEventListener("click", function () {
    window.location.href = "../restaurantsForm/restaurantsForm.html";
  });
} else {
  addBtn.style.display = "none";
}

// Naslov (Restorani)
const title = document.querySelector("#restaurant-title") as HTMLDivElement;
if (!ownerId) {
  title.textContent = "Restorani";
}

// Sakrivanje sortiranja
const sorterContainer = document.querySelector(
  "#sorter-container"
) as HTMLDivElement;
if (ownerId) {
  sorterContainer.style.display = "none";
}

function getOwnerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ownerId");
}

function loadAndRenderRestaurants(): void {
  if (isOwner && ownerId) {
    restaurantService
      .getAll(ownerId)
      .then((restaurants) => renderRestaurants(restaurants))
      .catch((error) =>
        console.error("Greška pri učitavanju restorana:", error)
      );
  } else {
    restaurantService
      .getPaged(1, 1000, orderBy, orderDirection)
      .then((result) => {
        const published = result.data.filter((r) => r.status === "objavljeno");

        const total = published.length;
        const start = (currentPage - 1) * pageSize;
        const paginated = published.slice(start, start + pageSize);

        renderRestaurants(paginated);
        renderPagination(total);
      })
      .catch((err) => console.error("Greška pri učitavanju restorana:", err));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderRestaurants();
});

import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

const addBtn = document.querySelector("#addBtn");
addBtn.addEventListener("click", function () {
  window.location.href = "../restaurantsForm/restaurantsForm.html";
});

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

    //Info div
    const info = document.createElement("div");
    info.className = "restaurant-info";

    //Prvo cu prikazati sliku
    const image = document.createElement("img");
    image.src = restaurant.imageUrl;
    image.className = "restaurant-image";

    //Zatim naslov
    const name = document.createElement("p");
    name.textContent = restaurant.name;
    name.className = "restaurant-name";

    //Opis
    const description = document.createElement("p");
    description.textContent = "Opis: " + restaurant.description;
    description.className = "restaurant-description";

    //Kapacitet
    const capacity = document.createElement("p");
    capacity.textContent = "Kapacitet: " + restaurant.capacity + " mesta";
    capacity.className = "restaurant-capacity";

    //Status
    const status = document.createElement("p");
    status.textContent = "Status: " + restaurant.status;
    status.className = "restaurant-status";
    const indicator = document.createElement("span");
    indicator.classList.add("status-indicator");

    if (restaurant.status === "u pripremi") {
      indicator.classList.add("status-preparation");
    } else if (restaurant.status === "objavljeno") {
      indicator.classList.add("status-published");
    }

    //Akcije div
    const actions = document.createElement("div");
    actions.className = "restaurants-actions";

    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Detalji";
    detailsBtn.className = "restaurant-button";
    detailsBtn.addEventListener("click", function () {
      window.location.href = `../restaurantDetails/restaurantDetails.html?id=${restaurant.id}`;
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Izmeni";
    editBtn.className = "restaurant-button";
    editBtn.addEventListener("click", function () {
      window.location.href = `../restaurantsForm/restaurantsForm.html?id=${restaurant.id}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Obrisi";
    deleteBtn.className = "restaurant-button";
    deleteBtn.id = "deleteBtn";
    deleteBtn.addEventListener("click", function () {
      restaurantService
        .delete(restaurant.id.toString())
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error.status, error.text);
        });
    });

    status.appendChild(indicator);
    actions.appendChild(detailsBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(capacity);
    info.appendChild(status);
    card.appendChild(image);
    card.appendChild(info);
    card.appendChild(actions);
    div.appendChild(card);
  });
}

window.addEventListener("scroll", () => {
  const stickyDiv = document.querySelector("#restaurants-title-container");
  if (window.scrollY > 100) {
    stickyDiv?.classList.add("scrolled");
  } else {
    stickyDiv?.classList.remove("scrolled");
  }
});

function getOwnerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ownerId");
}

const ownerId = getOwnerIdFromUrl();

function loadAndRenderRestaurants(): void {
  restaurantService
    .getAll(ownerId)
    .then((restaurants) => renderRestaurants(restaurants))
    .catch((error) => console.error("Greška pri učitavanju restorana:", error));
}

const logout = document.querySelector('#logout') as HTMLAnchorElement;
logout.addEventListener("click", ()=>{
  localStorage.removeItem("user");
  window.location.href = "../../../users/pages/login/login.html";

})

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderRestaurants();
});

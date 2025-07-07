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

    //Zatim naslov
    const name = document.createElement("p");
    name.textContent = restaurant.name;
    name.className = "restaurant-name";

    //Opis
    const description = document.createElement("p");
    description.textContent = restaurant.description;
    description.className = "restaurant-description";

    //Kapacitet
    const capacity = document.createElement("p");
    capacity.textContent = "Kapacitet: " + restaurant.capacity + " mesta";
    capacity.className = "restaurant-capacity";

    //Status
    if (restaurant.status === "u pripremi") {
      card.classList.add("status-preparation");
    } else if (restaurant.status === "objavljeno") {
      card.classList.add("status-published");
    }

    //Akcije div
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
    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(capacity);
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

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderRestaurants();
});

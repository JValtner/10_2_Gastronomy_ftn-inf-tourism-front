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
    const card = document.createElement("div");
    card.className = "restaurant-card";

    //Prvo cu prikazati sliku
    const image = document.createElement("img");
    image.src = restaurant.imageURL;
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
    status.textContent = restaurant.status;
    status.className = "restaurant-status";

    //Akcije div
    const actions = document.createElement("div");
    actions.className = "restaurants-actions";

    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Detalji";
    detailsBtn.className = "restaurant-button";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Izmeni";
    editBtn.className = "restaurant-button";
    editBtn.addEventListener("click", function () {
      window.location.href = `../restaurantsForm/restaurantsForm.html?id=${restaurant.id}`;
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Obrisi";
    deleteBtn.className = "restaurant-button";
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

    actions.appendChild(detailsBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(description);
    card.appendChild(capacity);
    card.appendChild(status);
    card.append(actions);
    div.appendChild(card);
  });
}

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

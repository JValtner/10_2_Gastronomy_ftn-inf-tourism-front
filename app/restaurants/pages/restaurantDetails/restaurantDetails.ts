//import { Meal } from "../../model/meal.model.js";
import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

function getRestaurantIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderRestaurant(restaurant: Restaurant): void {
  const restaurantDetails = document.querySelector("#restaurant-details-text");
  const restaurantPhotos = document.querySelector("#restaurant-details-photos");
  const headTitle = document.querySelector("#restaurant-details-head-title");
  const restaurantTitle = document.querySelector("#restaurant-title");

  //Head title
  headTitle.textContent = restaurant.name;

  //Restaurant title
  restaurantTitle.textContent = restaurant.name;

  //Ime restorana
  const name = document.createElement("p");
  name.textContent = restaurant.name;
  name.className = "restaurant-name";

  //Opis restorana
  const description = document.createElement("p");
  description.textContent = restaurant.description;
  description.className = "restaurant-description";

  //Kapacitet
  const capacity = document.createElement("p");
  capacity.textContent = "Kapacitet: " + restaurant.capacity + " mesta";
  capacity.className = "restaurant-capacity";

  //Status
  const status = document.createElement("p");
  status.textContent = restaurant.status;
  status.className = "restaurant-status";

  //Latituda
  const latitude = document.createElement("p");
  latitude.textContent = restaurant.latitude.toString();
  latitude.className = "restaurant-location";

  //Longituda
  const longitude = document.createElement("p");
  longitude.textContent = restaurant.longitude.toString();
  longitude.className = "restaurant-location";

  //Slika
  const image = document.createElement("img");
  image.src = restaurant.imageUrl;
  image.className = "restaurant-image";

  //Apends
  restaurantDetails.appendChild(name);
  restaurantDetails.appendChild(description);
  restaurantDetails.appendChild(capacity);
  restaurantDetails.appendChild(status);
  restaurantDetails.appendChild(latitude);
  restaurantDetails.appendChild(longitude);
  restaurantPhotos.appendChild(image);
}

function loadAndRenderRestaurant(): void {
  const restaurantId = getRestaurantIdFromUrl();
  restaurantService
    .getById(restaurantId)
    .then((restaurant) => renderRestaurant(restaurant))
    .catch((error) => console.error("Greška pri učitavanju restorana:", error));
}

document.addEventListener("DOMContentLoaded", loadAndRenderRestaurant);

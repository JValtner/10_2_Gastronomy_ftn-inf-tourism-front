//import { Meal } from "../../model/meal.model.js";
import { Meal } from "../../model/meal.model.js";
import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

const addMealBtn = document.querySelector("#addMealBtn");
addMealBtn.addEventListener("click", function () {
  const restaurantId = getRestaurantIdFromUrl();
  if (!restaurantId) {
    alert("ID restorana nije pronađen.");
    return;
  }
  window.location.href = `../mealForm/mealForm.html?id=${restaurantId}`;
});

function getRestaurantIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function changeTitles(restaurant: Restaurant): void {
  const headTitle = document.querySelector("#restaurant-details-head-title");
  const restaurantTitle = document.querySelector("#restaurant-title");
  headTitle.textContent = restaurant.name;
  restaurantTitle.textContent = restaurant.name;
}

function renderRestaurant(restaurant: Restaurant): void {
  const restaurantDetails = document.querySelector("#restaurant-details-text");
  const restaurantPhotos = document.querySelector("#restaurant-details-photos");

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

function renderMeals(restaurant: Restaurant): void {
  const div = document.querySelector("#meals-container");
  if (!div) return;

  const meals: Meal[] = restaurant.meals;
  meals.forEach((meal) => {
    //Kreiraj karticu
    const card = document.createElement("div");
    card.className = "meal-card";

    //Kreiraj Info div
    const info = document.createElement("div");
    info.className = "meal-info";

    //Kreiraj Sliku
    const image = document.createElement("img");
    image.src = meal.imageUrl;
    image.className = "meal-image";

    //Zatim naslov
    const name = document.createElement("p");
    name.textContent = meal.name;
    name.className = "meal-name";

    //Sastojci
    const ingredients = document.createElement("p");
    ingredients.textContent = "Sastojci: " + meal.ingredients;
    ingredients.className = "meal-ingredients";

    //Cena
    const price = document.createElement("p");
    price.textContent = "Cena: " + meal.price.toString() + " EUR";
    price.className = "meal-price";

    //Akcije div
    const actions = document.createElement("div");
    actions.className = "meal-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Obrisi";
    deleteBtn.className = "restaurant-button";
    deleteBtn.id = "deleteBtn";
    deleteBtn.addEventListener("click", function () {
      restaurantService
        .deleteMeal(restaurant.id.toString(), meal.id.toString())
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error.status, error.text);
        });
    });

    info.appendChild(name);
    info.appendChild(ingredients);
    info.appendChild(price);
    actions.append(deleteBtn);
    card.appendChild(image);
    card.appendChild(info);
    card.appendChild(actions);
    div.appendChild(card);
  });
}

function loadAndRenderRestaurant(): void {
  const restaurantId = getRestaurantIdFromUrl();
  restaurantService
    .getById(restaurantId)
    .then((restaurant) => {
      renderRestaurant(restaurant);
      changeTitles(restaurant);
      renderMeals(restaurant);
    })
    .catch((error) => console.error("Greška pri učitavanju restorana:", error));
}

document.addEventListener("DOMContentLoaded", loadAndRenderRestaurant);

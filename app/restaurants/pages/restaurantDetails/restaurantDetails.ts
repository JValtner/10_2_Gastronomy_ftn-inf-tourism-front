import { Meal } from "../../model/meal.model.js";
import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

const isOwner = localStorage.getItem("role") === "vlasnik";
const ownerId = isOwner ? localStorage.getItem("userId") : null;

// Dugmad na vrhu stranica
// Dodaj novo jelo
const addMealBtn = document.querySelector("#addMealBtn") as HTMLButtonElement;
addMealBtn.addEventListener("click", function () {
  const restaurantId = getRestaurantIdFromUrl();
  if (!restaurantId) {
    alert("ID restorana nije pronađen.");
    return;
  }
  window.location.href = `../mealForm/mealForm.html?id=${restaurantId}`;
});

// Izmeni restoran
const changeRestaurantBtn = document.querySelector(
  "#changeRestaurant"
) as HTMLButtonElement;
changeRestaurantBtn.addEventListener("click", function () {
  const restaurantId = getRestaurantIdFromUrl();
  if (!restaurantId) {
    alert("ID restorana nije pronađen.");
    return;
  }
  window.location.href = `../restaurantsForm/restaurantsForm.html?id=${restaurantId}`;
});

// Tvoji restorani
const yourRestaurantsBtn = document.querySelector(
  "#yourRestaurants"
) as HTMLButtonElement;
yourRestaurantsBtn.addEventListener("click", function () {
  const ownerId = localStorage.getItem("userId");
  window.location.href = `../restaurants/restaurants.html?ownerId=${ownerId}`;
});

const allBtns = [addMealBtn, changeRestaurantBtn, yourRestaurantsBtn];
if (!isOwner) {
  allBtns.forEach((btn) => {
    if (btn) {
      btn.style.display = "none";
    }
  });
}

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

// Prikaz restorana
function renderRestaurant(restaurant: Restaurant): void {
  const restaurantDetails = document.querySelector("#restaurant-details-text");
  const restaurantPhotos = document.querySelector("#restaurant-details-photos");

  //Ime restorana
  const name = document.createElement("p");
  name.textContent = restaurant.name;
  name.className = "restaurant-name";
  restaurantDetails.appendChild(name);

  //Opis restorana
  const description = document.createElement("p");
  description.textContent = restaurant.description;
  description.className = "restaurant-description";
  restaurantDetails.appendChild(description);

  //Kapacitet
  const capacity = document.createElement("p");
  capacity.textContent = "Kapacitet: " + restaurant.capacity + " mesta";
  capacity.className = "restaurant-capacity";
  restaurantDetails.appendChild(capacity);

  //Location
  const location = document.createElement("p");
  location.textContent =
    "Lokacija: " +
    restaurant.latitude.toString() +
    " - " +
    restaurant.longitude.toString();
  location.className = "restaurant-location";
  restaurantDetails.appendChild(location);

  //Status
  const status = document.createElement("p");
  if (ownerId) {
    status.className = "restaurant-status";
    status.textContent = "Status: " + restaurant.status;

    const indicator = document.createElement("span");
    indicator.classList.add("status-indicator");

    if (restaurant.status === "u pripremi") {
      indicator.classList.add("status-preparation");
    } else if (restaurant.status === "objavljeno") {
      indicator.classList.add("status-published");
    }
    status.appendChild(indicator);
    restaurantDetails.appendChild(status);
  } else {
    status.style.display = "none";
  }

  //Rezervacije
  const resBtnHolder = document.createElement("div");
  if (!ownerId) {
    resBtnHolder.id = "resBtnHolder";

    const resBtn = document.createElement("button");
    resBtn.classList.add("restaurant-button");
    resBtn.id = "resBtn";
    resBtn.textContent = "Rezervisi";
    const restaurantId = getRestaurantIdFromUrl();
    resBtn.addEventListener("click", function () {
      window.location.href = `../../../restaurantReservations/pages/restaurantReservationsForm/restaurantReservationsForm.html?id=${restaurantId}`;
    });
    resBtnHolder.appendChild(resBtn);
  }

  //Slika
  const image = document.createElement("img");
  image.src = restaurant.imageUrl;
  image.className = "restaurant-image";

  //Apends
  restaurantDetails.appendChild(resBtnHolder);
  restaurantPhotos.appendChild(image);
}

// Prikaz obroka
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
    info.appendChild(name);

    //Sastojci
    const ingredients = document.createElement("p");
    ingredients.textContent = "Sastojci: " + meal.ingredients;
    ingredients.className = "meal-ingredients";
    info.appendChild(ingredients);

    //Cena
    const price = document.createElement("p");
    price.textContent = meal.price.toString() + " EUR";
    price.className = "meal-price";
    info.appendChild(price);

    //Akcije div
    const actions = document.createElement("div");
    actions.className = "meal-actions";

    const deleteBtn = document.createElement("button");
    if (ownerId) {
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
      actions.append(deleteBtn);
    }

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

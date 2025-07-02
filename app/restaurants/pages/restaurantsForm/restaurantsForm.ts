import { Restaurant } from "../../model/restaurant.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

let restaurantMealsCount = 0;

// Elementi
const nameInput = document.getElementById("name") as HTMLInputElement;
const descriptionInput = document.getElementById(
  "description"
) as HTMLTextAreaElement;
const capacityInput = document.getElementById("capacity") as HTMLInputElement;
const imageURLInput = document.getElementById("imageURL") as HTMLInputElement;
const latitudeInput = document.getElementById("latitude") as HTMLInputElement;
const longitudeInput = document.getElementById("longitude") as HTMLInputElement;
const mealCount = document.querySelector("#meals-count");
const statusRadios = document.querySelectorAll(
  'input[name="status"]'
) as NodeListOf<HTMLInputElement>;
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;

// Error elementi
const nameError = document.getElementById("name-error") as HTMLSpanElement;
const descriptionError = document.getElementById(
  "description-error"
) as HTMLSpanElement;
const capacityError = document.getElementById(
  "capacity-error"
) as HTMLSpanElement;
const imageURError = document.getElementById(
  "imageURL-error"
) as HTMLSpanElement;
const latitudeError = document.getElementById(
  "latitude-error"
) as HTMLSpanElement;
const longitudeError = document.getElementById(
  "longitude-error"
) as HTMLSpanElement;

submitBtn.disabled = true;

// id iz url
function getIdFromQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Popunjavanje forme
function fillForm(restaurantId: string): void {
  restaurantService.getById(restaurantId).then((restaurant) => {
    nameInput.value = restaurant.name;
    descriptionInput.value = restaurant.description;
    capacityInput.value = restaurant.capacity.toString();
    imageURLInput.value = restaurant.imageUrl;
    latitudeInput.value = restaurant.latitude.toString();
    longitudeInput.value = restaurant.longitude.toString();
    statusRadios.forEach((radio) => {
      radio.checked = radio.value === restaurant.status;
    });
    restaurantMealsCount = restaurant.meals.length;
    if (mealCount) {
      mealCount.textContent = `Broj jela u ponudi: ${restaurant.meals.length}`;
      mealCount.classList.remove("success", "warning");
      mealCount.classList.add(
        restaurantMealsCount >= 5 ? "success" : "warning"
      );
    }
    updateStatusRadios();
    updateSubmitButton();
  });
}

// Validacije
function validateName(): boolean {
  const value = nameInput.value.trim();
  if (value.length < 2) {
    nameError.style.visibility = "visible";
    return false;
  } else {
    nameError.style.visibility = "hidden";
    return true;
  }
}

function validateDescription(): boolean {
  const value = descriptionInput.value.trim();
  if (value.length === 0 || value.length > 250) {
    descriptionError.textContent = "Opis mora imati izmedju 1 i 250 karaktera";
    descriptionError.style.visibility = "visible";
    return false;
  } else {
    descriptionError.style.visibility = "hidden";
    return true;
  }
}

function validateCapacity(): boolean {
  const value = capacityInput.value.trim();
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed <= 0) {
    capacityError.style.visibility = "visible";
    return false;
  } else {
    capacityError.style.visibility = "hidden";
    return true;
  }
}

function validateImgURL(): boolean {
  const value = imageURLInput.value.trim();
  if (value === "") {
    imageURError.style.visibility = "visible";
    return false;
  } else {
    imageURError.style.visibility = "hidden";
    return true;
  }
}

function validateLatitude(): boolean {
  const value = latitudeInput.value.trim();
  if (value === "") {
    latitudeError.style.visibility = "visible";
    return false;
  } else {
    latitudeError.style.visibility = "hidden";
    return true;
  }
}

function validateLongitude(): boolean {
  const value = longitudeInput.value.trim();
  if (value === "") {
    longitudeError.style.visibility = "visible";
    return false;
  } else {
    longitudeError.style.visibility = "hidden";
    return true;
  }
}

// Provera za objavu restorana
function canPublish(): boolean {
  const hasEnoughMeals = restaurantMealsCount >= 5;
  const imageUrlValid = imageURLInput.value.trim() !== "";

  return hasEnoughMeals && imageUrlValid;
}

// Uklj/Isklj radio dugme za objavu restorana
function updateStatusRadios() {
  statusRadios.forEach((radio) => {
    if (radio.value === "objavljeno") {
      radio.disabled = !canPublish();
      if (radio.disabled && radio.checked) {
        radio.checked = false;
      }
    }
  });
}

// Uklj/isklj dugme
function updateSubmitButton(): boolean {
  const valid =
    validateName() &&
    validateDescription() &&
    validateCapacity() &&
    validateImgURL() &&
    validateLatitude() &&
    validateLongitude();

  submitBtn.disabled = !valid;
  return valid;
}

// Spineri
function showSpinner(): void {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.classList.remove("hidden");
}

function hideSpinner(): void {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) spinner.classList.add("hidden");
}

// Submit forme
function submitForm(): void {
  const formData: Restaurant = {
    name: nameInput.value.trim(),
    description: descriptionInput.value.trim(),
    capacity: parseInt(capacityInput.value.trim()),
    imageUrl: imageURLInput.value.trim(),
    latitude: parseFloat(latitudeInput.value.trim()),
    longitude: parseFloat(longitudeInput.value.trim()),
    status:
      Array.from(statusRadios).find((r) => r.checked)?.value || "u pripremi",
    ownerId: parseInt(localStorage.getItem("userId") || "0"),
    meals: [],
  };

  const ownerId = parseInt(localStorage.getItem("userId") || "0");
  const id = getIdFromQuery();
  if (id) {
    restaurantService
      .update(id, formData)
      .then(() => {
        window.location.href = `../restaurants/restaurants.html?ownerId=${ownerId}`;
      })
      .catch((error) => {
        console.error(error.status, error.text);
        hideSpinner();
      });
  } else {
    restaurantService
      .add(formData)
      .then(() => {
        window.location.href = `../restaurants/restaurants.html?ownerId=${ownerId}`;
      })
      .catch((error) => {
        console.error(error.status, error.text);
        hideSpinner();
      });
  }
}

// Event lisneri
nameInput.addEventListener("blur", () => {
  validateName();
  updateSubmitButton();
});
descriptionInput.addEventListener("blur", () => {
  validateDescription();
  updateSubmitButton();
});
capacityInput.addEventListener("blur", () => {
  validateCapacity();
  updateSubmitButton();
});
imageURLInput.addEventListener("blur", () => {
  validateImgURL();
  updateStatusRadios();
  updateSubmitButton();
});
latitudeInput.addEventListener("blur", () => {
  validateLatitude();
  updateSubmitButton();
});
longitudeInput.addEventListener("blur", () => {
  validateLongitude();
  updateSubmitButton();
});

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (updateSubmitButton()) {
    showSpinner();
    submitForm();
  }
});

const id = getIdFromQuery();
if (id) {
  const title = document.querySelector("#new-restaurant-title");
  title.innerHTML = "Izmeni restoran";
  const headTitle = document.querySelector("#restaurant-head-title");
  headTitle.innerHTML = "Izmeni restoran";
  fillForm(id);
}

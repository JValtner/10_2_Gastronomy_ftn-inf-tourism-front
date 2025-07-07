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
const imageURLError = document.getElementById(
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
    nameError.textContent = "Ime mora imati najmanje 2 karaktera";
    nameError.classList.add("visible");
    nameInput.classList.add("input-error");
    nameInput.classList.remove("input-valid");
    return false;
  } else {
    nameError.classList.remove("visible");
    nameInput.classList.remove("input-error");
    nameInput.classList.add("input-valid");
    return true;
  }
}

function validateDescription(): boolean {
  const value = descriptionInput.value.trim();
  if (value.length === 0 || value.length > 250) {
    descriptionError.textContent = "Opis mora imati izmedju 1 i 250 karaktera";
    descriptionError.classList.add("visible");
    descriptionInput.classList.add("input-error");
    return false;
  } else {
    descriptionError.classList.remove("visible");
    descriptionInput.classList.remove("input-error");
    descriptionInput.classList.add("input-valid");
    return true;
  }
}

function validateCapacity(): boolean {
  const value = capacityInput.value.trim();
  const parsed = parseInt(value);
  if (isNaN(parsed)) {
    capacityError.textContent = "Kapacitet restorana je obavezno polje";
    capacityError.classList.add("visible");
    capacityInput.classList.add("input-error");
    capacityInput.classList.remove("input-valid");
    return false;
  }

  if (parsed <= 0) {
    capacityError.textContent = "Kapacitet restorana ne moze biti 0";
    capacityError.classList.add("visible");
    capacityInput.classList.add("input-error");
    capacityInput.classList.remove("input-valid");
  } else {
    capacityError.classList.remove("visible");
    capacityInput.classList.remove("input-error");
    capacityInput.classList.add("input-valid");
    return true;
  }
}

function validateImgURL(): boolean {
  const value = imageURLInput.value.trim();
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

  if (value === "") {
    imageURLError.textContent = "URL slike je obavezno polje";
    imageURLError.classList.add("visible");
    imageURLInput.classList.add("input-error");
    imageURLInput.classList.remove("input-valid");
    return false;
  }

  if (!imageURLInput.validity.valid) {
    imageURLError.textContent = "Unesite validan URL";
    imageURLError.classList.add("visible");
    imageURLInput.classList.add("input-error");
    imageURLInput.classList.remove("input-valid");
    return false;
  }

  if (!imageExtensions.test(value)) {
    imageURLError.textContent = "URL mora biti slika (jpg, png, gif, webp...)";
    imageURLError.classList.add("visible");
    imageURLInput.classList.add("input-error");
    imageURLInput.classList.remove("input-valid");
    return false;
  }

  imageURLError.classList.remove("visible");
  imageURLInput.classList.remove("input-error");
  imageURLInput.classList.add("input-valid");
  return true;
}

function validateLatitude(): boolean {
  const value = latitudeInput.value.trim();
  if (value === "") {
    latitudeError.textContent = "Geografska sirina je obavezno polje";
    latitudeError.classList.add("visible");
    latitudeInput.classList.add("input-error");
    latitudeInput.classList.remove("input-valid");
    return false;
  } else {
    latitudeError.classList.remove("visible");
    latitudeInput.classList.remove("input-error");
    latitudeInput.classList.add("input-valid");
    return true;
  }
}

function validateLongitude(): boolean {
  const value = longitudeInput.value.trim();
  if (value === "") {
    longitudeError.textContent = "Geografska duzina je obavezno polje";
    longitudeError.classList.add("visible");
    longitudeInput.classList.add("input-error");
    longitudeInput.classList.remove("input-valid");
    return false;
  } else {
    longitudeError.classList.remove("visible");
    longitudeInput.classList.remove("input-error");
    longitudeInput.classList.add("input-valid");
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

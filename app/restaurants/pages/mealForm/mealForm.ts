import { Meal } from "../../model/meal.model.js";
import { RestaurantService } from "../../service/restaurant.service.js";

const restaurantService = new RestaurantService();

// Elementi
const nameInput = document.getElementById("name") as HTMLInputElement;
const ingredientsInput = document.getElementById(
  "ingredients"
) as HTMLTextAreaElement;
const priceInput = document.getElementById("price") as HTMLInputElement;
const imageURLInput = document.getElementById("imageURL") as HTMLInputElement;
const submitBtn = document.getElementById("submitBtn") as HTMLButtonElement;

// Error elementi
const nameError = document.getElementById("name-error") as HTMLSpanElement;
const ingredientsError = document.getElementById(
  "ingredients-error"
) as HTMLSpanElement;
const priceError = document.getElementById("price-error") as HTMLSpanElement;
const imageURLError = document.getElementById(
  "imageURL-error"
) as HTMLSpanElement;

submitBtn.disabled = true;

// id restorana iz URL-a
function getRestaurantIdFromQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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

function validateIngredients(): boolean {
  const value = ingredientsInput.value.trim();
  if (value.length === 0) {
    ingredientsError.textContent =
      "Odeljak sa sastojcima mora imati izmedju 1 i 250 karaktera";
    ingredientsError.classList.add("visible");
    ingredientsInput.classList.add("input-error");
    return false;
  } else {
    ingredientsError.classList.remove("visible");
    ingredientsInput.classList.remove("input-error");
    ingredientsInput.classList.add("input-valid");
    return true;
  }
}

function validatePrice(): boolean {
  const value = priceInput.value.trim();
  const parsed = parseFloat(value);
  if (value === "" || isNaN(parsed)) {
    priceError.textContent = "Polje je obavezno";
    priceError.classList.add("visible");
    priceInput.classList.add("input-error");
    return false;
  }
  if (parsed <= 0) {
    priceError.textContent = "Cena ne moze biti 0 ili manje od 0";
    priceError.classList.add("visible");
    priceInput.classList.add("input-error");
    return false;
  } else {
    priceError.classList.remove("visible");
    priceInput.classList.remove("input-error");
    priceInput.classList.add("input-valid");
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
  } else {
    imageURLError.classList.remove("visible");
    imageURLInput.classList.remove("input-error");
    imageURLInput.classList.add("input-valid");
    return true;
  }
}

// Ukljuci/Iskljuci submit dugme
function updateSubmitButton(): boolean {
  const valid =
    validateName() &&
    validateIngredients() &&
    validatePrice() &&
    validateImgURL();
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
function submitForm(restaurantId: string): void {
  const formData: Meal = {
    name: nameInput.value.trim(),
    ingredients: ingredientsInput.value.trim(),
    price: parseFloat(priceInput.value.trim()),
    imageUrl: imageURLInput.value.trim(),
    order: 1,
    restaurantId: parseInt(restaurantId),
  };

  restaurantService
    .addMeal(restaurantId, formData)
    .then(() => {
      window.location.href = `../restaurantDetails/restaurantDetails.html?id=${restaurantId}`;
    })
    .catch((error) => {
      console.error(error.status, error.text);
      hideSpinner();
    });
}

// Event listeners
[nameInput, ingredientsInput, priceInput, imageURLInput].forEach((input) => {
  input.addEventListener("blur", updateSubmitButton);
});

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const rId = getRestaurantIdFromQuery();
  if (rId && updateSubmitButton()) {
    showSpinner();
    submitForm(rId);
  }
});

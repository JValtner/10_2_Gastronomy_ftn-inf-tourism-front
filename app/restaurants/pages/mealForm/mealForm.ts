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
  nameError.style.visibility = value.length < 2 ? "visible" : "hidden";
  return value.length >= 2;
}

function validateIngredients(): boolean {
  const value = ingredientsInput.value.trim();
  if (value.length === 0 || value.length > 250) {
    ingredientsError.textContent = "Polje mora imati između 1 i 250 karaktera";
    ingredientsError.style.visibility = "visible";
    return false;
  }
  ingredientsError.style.visibility = "hidden";
  return true;
}

function validatePrice(): boolean {
  const value = priceInput.value.trim();
  const parsed = parseFloat(value);
  if (parsed < 0) {
    priceError.style.visibility = "visible";
    return false;
  }
  priceError.style.visibility = "hidden";
  return true;
}

function validateImgURL(): boolean {
  const value = imageURLInput.value.trim();
  if (value === "") {
    imageURLError.style.visibility = "visible";
    return false;
  } else {
    imageURLError.style.visibility = "hidden";
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

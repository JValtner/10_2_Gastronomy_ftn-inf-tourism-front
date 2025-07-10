import { RestaurantReservationService } from "../../service/restaurantReservation.service.js";

const restaurantReservationsService = new RestaurantReservationService();

// Elementi
const dateInput = document.querySelector(
  "#reservation-date"
) as HTMLInputElement;
const mealTypeRadios = document.querySelectorAll(
  'input[name="meal-type"]'
) as NodeListOf<HTMLInputElement>;
const guestCountInput = document.querySelector(
  "#guest-count"
) as HTMLInputElement;
const submitBtn = document.querySelector("#submitBtn") as HTMLButtonElement;

// Error elementi
const dateError = document.querySelector(
  "#reservation-date-error"
) as HTMLSpanElement;
const mealTypeError = document.querySelector(
  "#meal-type-error"
) as HTMLSpanElement;
const guestCountError = document.querySelector(
  "#guest-count-error"
) as HTMLSpanElement;

submitBtn.disabled = true;

// ID restorana iz URL-a
function getRestaurantIdFromQuery(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Validacije
function validateDate(): boolean {
  const value = dateInput.value.trim();
  if (value === "") {
    dateError.textContent = "Datum je obavezno polje";
    dateError.classList.add("visible");
    dateInput.classList.add("input-error");
    dateInput.classList.remove("input-valid");
    return false;
  }

  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    dateError.textContent = "Datum mora biti u budućnosti";
    dateError.classList.add("visible");
    dateInput.classList.add("input-error");
    dateInput.classList.remove("input-valid");
    return false;
  } else {
    dateError.classList.remove("visible");
    dateInput.classList.remove("input-error");
    dateInput.classList.add("input-valid");
    return true;
  }
}

function validateMealType(): boolean {
  const selectedMealType = Array.from(mealTypeRadios).find(
    (radio) => radio.checked
  );

  if (!selectedMealType) {
    mealTypeError.textContent = "Molimo odaberite tip obroka";
    mealTypeError.classList.add("visible");
    mealTypeRadios.forEach((radio) => {
      radio.classList.add("input-error");
      radio.classList.remove("input-valid");
    });
    return false;
  } else {
    mealTypeError.classList.remove("visible");
    mealTypeRadios.forEach((radio) => {
      radio.classList.remove("input-error");
      radio.classList.add("input-valid");
    });
    return true;
  }
}

function validateGuestCount(): boolean {
  const value = guestCountInput.value.trim();
  const parsed = parseInt(value);

  if (value === "" || isNaN(parsed)) {
    guestCountError.textContent = "Broj gostiju je obavezno polje";
    guestCountError.classList.add("visible");
    guestCountInput.classList.add("input-error");
    guestCountInput.classList.remove("input-valid");
    return false;
  }

  if (parsed <= 0) {
    guestCountError.textContent = "Broj gostiju mora biti veći od 0";
    guestCountError.classList.add("visible");
    guestCountInput.classList.add("input-error");
    guestCountInput.classList.remove("input-valid");
    return false;
  } else {
    guestCountError.classList.remove("visible");
    guestCountInput.classList.remove("input-error");
    guestCountInput.classList.add("input-valid");
    return true;
  }
}

// Ukljuci/Iskljuci submit dugme
function updateSubmitButton(): boolean {
  const valid = validateDate() && validateMealType() && validateGuestCount();
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
  const selectedMealType = Array.from(mealTypeRadios).find(
    (radio) => radio.checked
  )?.value;

  // Proveri da li je restaurantId validan
  if (!restaurantId) {
    alert("Greška: ID restorana nije pronađen!");
    hideSpinner();
    return;
  }

  // Proveri da li je userId validan
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("Greška: Korisnik nije ulogovan!");
    hideSpinner();
    return;
  }

  const formData = {
    restaurantId: restaurantId,
    userId: userId,
    reservationDate: new Date(dateInput.value.trim()).toISOString(), // Konvertuj u ISO string
    mealType: selectedMealType as "dorucak" | "rucak" | "vecera",
    numberOfGuests: parseInt(guestCountInput.value.trim()),
    status: "confirmed" as const,
  };

  restaurantReservationsService
    .create(formData)
    .then(() => {
      alert("Rezervacija je uspešno kreirana!");
      window.location.href = `../restaurantReservations/restaurantReservations.html`;
    })
    .catch((error) => {
      console.error("Greška pri kreiranju rezervacije:", error);
      hideSpinner();
      alert("Greška pri kreiranju rezervacije. Pokušajte ponovo.");
    });
}

// Event listeners
dateInput.addEventListener("blur", updateSubmitButton);
guestCountInput.addEventListener("blur", updateSubmitButton);

// Event listeners za radio buttons
mealTypeRadios.forEach((radio) => {
  radio.addEventListener("change", updateSubmitButton);
});

submitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const restaurantId = getRestaurantIdFromQuery();

  if (!restaurantId) {
    return;
  }

  if (updateSubmitButton()) {
    showSpinner();
    submitForm(restaurantId);
  }
});

// Inicijalno postavljanje datuma na sutrašnji dan
window.addEventListener("DOMContentLoaded", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = tomorrow.toISOString().split("T")[0];

  // Inicijalna validacija
  updateSubmitButton();
});

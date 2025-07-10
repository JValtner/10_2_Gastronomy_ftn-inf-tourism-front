import { RestaurantReservation } from "../../model/restaurantReservation.model.js";
import { RestaurantReservationService } from "../../service/restaurantReservation.service.js";

const restaurantReservationService = new RestaurantReservationService();

const userId = localStorage.getItem("userId");

function renderReservations(reservations: RestaurantReservation[]): void {
  const div = document.querySelector("#reservations-container");

  if (!div) {
    console.error("reservations-container not found");
    return;
  }
  if (reservations.length === 0) {
    div.innerHTML = "Nemate aktivnih rezervacija";
    return;
  }

  div.innerHTML = "";

  reservations.forEach((reservation) => {
    const card = document.createElement("div");
    card.className = "reservation-card";

    const info = document.createElement("div");
    info.className = "restaurant-info";

    const restaurantName = document.createElement("p");
    restaurantName.textContent = reservation.restaurant.name;
    restaurantName.className = "reservation-restaurant-name";
    info.appendChild(restaurantName);

    const reservationDate = document.createElement("p");
    const date = new Date(reservation.reservationDate);
    reservationDate.textContent = date.toDateString();
    reservationDate.className = "reservation-date-time";
    info.appendChild(reservationDate);

    const numberOfGuests = document.createElement("p");
    numberOfGuests.textContent = `Broj gostiju: ${reservation.numberOfGuests}`;
    numberOfGuests.className = "reservation-guest-number";
    info.appendChild(numberOfGuests);

    const mealType = document.createElement("p");
    if (reservation.mealType === "dorucak") {
      mealType.textContent = `Obrok: ${reservation.mealType} (8:00)`;
    } else if (reservation.mealType === "rucak") {
      mealType.textContent = `Obrok: ${reservation.mealType} (13:00)`;
    } else if (reservation.mealType === "vecera") {
      mealType.textContent = `Obrok: ${reservation.mealType} (18:00)`;
    } else {
      mealType.textContent = `Obrok: ${reservation.mealType}`;
    }
    info.appendChild(mealType);

    const actions = document.createElement("div");
    actions.className = "restaurants-actions";

    const restaurantId = reservation.restaurant.id?.toString();
    const restaurantDetailsBtn = document.createElement("button");
    restaurantDetailsBtn.textContent = "Vidi restoran";
    restaurantDetailsBtn.classList.add("restaurant-button");
    restaurantDetailsBtn.addEventListener("click", function () {
      if (restaurantId) {
        window.location.href = `../../../restaurants/pages/restaurantDetails/restaurantDetails.html?id=${restaurantId}`;
      }
    });
    actions.appendChild(restaurantDetailsBtn);

    const cancelReservationBtn = document.createElement("button");
    cancelReservationBtn.textContent = "Otkazi";
    cancelReservationBtn.classList.add("restaurant-button");
    cancelReservationBtn.id = "cancelBtn";
    cancelReservationBtn.addEventListener("click", function () {
      if (!reservation.id) {
        return;
      }
      restaurantReservationService
        .cancel(reservation.id)
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error.status, error.text);
        });
    });
    actions.appendChild(cancelReservationBtn);

    card.appendChild(info);
    card.appendChild(actions);
    div.appendChild(card);
  });
}

function loadAndRenderReservations(): void {
  if (!userId) {
    const div = document.querySelector("#reservations-container");
    if (div) {
      div.innerHTML = "Molimo se ulogujte da vidite svoje rezervacije";
    }
    return;
  }
  restaurantReservationService
    .getAll(userId)
    .then((reservations) => {
      renderReservations(reservations);
    })
    .catch((error) => {
      console.error("Greška pri učitavanju rezervacija:", error);
      const div = document.querySelector("#reservations-container");
      if (div) {
        div.innerHTML = "Greška pri učitavanju rezervacija. Pokušajte ponovo.";
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadAndRenderReservations();
});

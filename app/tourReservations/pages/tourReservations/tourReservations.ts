import { ReservationsServis } from "../../service/reservations.service.js"
import { TourReservations } from "../../model/tourReservations.model.js"

const reservationService = new ReservationsServis()

function getUserId(): number {
  return parseInt(localStorage.getItem("userId") || "0")
}

function renderReservationBlocks(reservations: TourReservations[]): void {
  const container = document.querySelector('.reservation-details-container') as HTMLElement
  container.innerHTML = "" // clear old content

  const reservationSection = document.createElement('section')
  reservationSection.classList.add('reservations-section')
  reservationSection.innerHTML = `<h2>Your Reservations</h2>`

  if (reservations.length === 0) {
    reservationSection.innerHTML += `<p>No reservations found.</p>`
  } else {
    for (const res of reservations) {
      const resBlock = document.createElement('div')
      resBlock.classList.add('reservation')
      resBlock.innerHTML = `
        <p><strong>Tour ID:</strong> ${res.tourId}</p>
        <p><strong>Number of Guests:</strong> ${res.numberOfGuests}</p>
        <p><strong>Date Reserved:</strong> ${formatDate(res.createdOn)}</p>
        <button class="del-res-btn">Delete reservation</button>
      `

      // Add event listener Delete btn
      const deleteBtn = resBlock.querySelector('.del-res-btn')
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          reservationService.delete(res.id.toString())
          location.reload()
        })
      }

      reservationSection.appendChild(resBlock)
    }

  }

  container.appendChild(reservationSection)
}
function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}  ${hours}:${minutes}`;
}
function loadReservations(): void {
  const userId = getUserId()
  if (!userId) {
    alert("User not logged in.")
    return
  }

  reservationService.getByUser(userId)
    .then((allReservations: TourReservations[]) => {
      renderReservationBlocks(allReservations)
    })
    .catch(error => {
      console.error("Error loading reservations:", error.message || error)
    })
}

window.addEventListener("DOMContentLoaded", () => {
  reservationService.getwelcome()
  loadReservations()
})

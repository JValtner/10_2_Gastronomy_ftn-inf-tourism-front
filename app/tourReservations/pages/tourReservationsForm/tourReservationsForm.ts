import { TourService } from "../../../tours/service/tour.service.js"
import { TourReservations } from "../../model/tourReservations.model.js"
import { ReservationsServis } from "../../service/reservations.service.js"

const tourService = new TourService()
const reservationService = new ReservationsServis()

function initializeForm(): void {
    const queryString = window.location.search
    const urlparams = new URLSearchParams(queryString)
    const tourId = urlparams.get('tourId')

    if (tourId) {
        tourService.getById(tourId)
            .then(tour => {
                (document.querySelector('#tour-name') as HTMLElement).textContent = `Naziv ture: ${tour.name}`;
                (document.querySelector('#user-name') as HTMLElement).textContent = `Vodic: ${tour.guide.username}`;
                (document.querySelector('#tour-date') as HTMLElement).textContent = `Datum i vreme: ${formatDate(tour.dateTime)}`;
                (document.querySelector('#tour-maxGuests') as HTMLElement).textContent = `Ukupan broj mesta na turi:${tour.maxGuests}`;
                (document.querySelector('#tour-availableGuests') as HTMLElement).textContent = `Raspoloziv broj mesta na turi: ${tourService.calculateAvailable(tour)}`;//TODO available room
            })
            .catch(error => {
                console.error(error.status, error.text)
            })
    }
}

function statusMsg(action: string): void {
    const status = document.getElementById('status-msg') as HTMLParagraphElement
    const text = document.getElementById('status-text') as HTMLSpanElement
    const bar = status.querySelector('.status-bar') as HTMLDivElement

    status.style.display = 'block'
    text.textContent = 'Postupak u toku...'

    bar.classList.remove('status-bar')
    void bar.offsetWidth // trigger reflow
    bar.classList.add('status-bar')

    setTimeout(() => {
        text.textContent = action === "new"
            ? "Rezervacija uspešno kreirana."
            : "Rezervacija je uspešno izmenjena."
    }, 4800)
}

function submit(redirectPath: string): void {
    const numGuestsInput = document.querySelector('#numGuests') as HTMLInputElement
    const number = parseInt(numGuestsInput.value)

    const urlParams = new URLSearchParams(window.location.search)
    const tourId = urlParams.get('tourId')
    const userId = localStorage.getItem('userId')

    if (!tourId || !userId || isNaN(number) || number <= 0) {
        const errMsg = document.getElementById('error-msg') as HTMLElement
        errMsg.textContent = "Neispravni podaci za rezervaciju."
        return
    }

    const formData: TourReservations = {
        tourId: parseInt(tourId),
        userId: parseInt(userId),
        numberOfGuests: number,
        createdOn: new Date().toISOString()
    }

    reservationService.addNew(formData)
        .then(() => {
            statusMsg("new")
            setTimeout(() => {
                window.location.href = redirectPath
            }, 5000)
        })
        .catch(error => {
            console.error(error)
            const msg = document.getElementById("error-msg")
            if (msg) msg.textContent = error.message || "Došlo je do greške prilikom rezervacije."
        })
}


// Format date
function formatDate(isoDateString: string): string {
    const date = new Date(isoDateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year}  ${hours}:${minutes}`
}

// Tooltips
function attachTooltipTimeouts() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltiptext') as HTMLElement
        if (!tooltipText) return

        let timeoutId: number | null = null

        tooltip.addEventListener('mouseenter', () => {
            timeoutId = window.setTimeout(() => {
                tooltipText.style.visibility = 'visible'
                tooltipText.style.opacity = '1'
            }, 500)
        })

        tooltip.addEventListener('mouseleave', () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }
            tooltipText.style.visibility = 'hidden'
            tooltipText.style.opacity = '0'
        })
    })
}

// Validation
const fieldArray: string[] = ['numGuests']
const fieldValid: { [key: string]: boolean } = {
    numGuests: false,
}

function validate(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement
    const errSpan = document.getElementById(`${id}-err`) as HTMLElement
    if (!input || !errSpan) return

    let errorMsg = ''
    const val = input.value.trim()

    if (id === 'numGuests') {
        const number = parseInt(val)
        if (isNaN(number) || number <= 0) {
            errorMsg = 'Broj gostiju mora biti pozitivan broj.'
        }
    }

    if (errorMsg) {
        fieldValid[id] = false
        errSpan.textContent = errorMsg
        errSpan.classList.add('visible')
    } else {
        fieldValid[id] = true
        errSpan.textContent = ''
        errSpan.classList.remove('visible')
    }

    validateForm()
}

function validateForm(): void {
    const buttons = document.querySelectorAll('.submit-btn') as NodeListOf<HTMLButtonElement>

    const allValid = fieldArray.every(fieldId => {
        const input = document.getElementById(fieldId) as HTMLInputElement
        return input && input.value.trim() !== '' && fieldValid[fieldId]
    })

    buttons.forEach(btn => {
        btn.disabled = !allValid
    })
}

// DOM Loaded
window.addEventListener("DOMContentLoaded", () => {
    initializeForm()
    attachTooltipTimeouts()

    // Setup validation listeners
    fieldArray.forEach(id => {
        const input = document.getElementById(id) as HTMLInputElement
        if (input) {
            input.addEventListener('input', () => validate(id))
        }
    })

    setTimeout(() => {
        fieldArray.forEach(id => validate(id))
        validateForm()
    }, 100)

    // Setup buttons
    const btnUserTours = document.getElementById('btn-user-tours') as HTMLButtonElement
    const btnMyReservations = document.getElementById('btn-my-reservations') as HTMLButtonElement

    if (btnUserTours) {
        btnUserTours.addEventListener('click', () => {
            fieldArray.forEach(id => validate(id))
            const allValid = fieldArray.every(fieldId => fieldValid[fieldId])
            if (allValid) submit("../../../tours/pages/userTours/userTours.html")
        })
    }

    if (btnMyReservations) {
        btnMyReservations.addEventListener('click', () => {
            fieldArray.forEach(id => validate(id))
            const allValid = fieldArray.every(fieldId => fieldValid[fieldId])
            if (allValid) submit("../tourReservations/tourReservations.html")
        })
    }
})

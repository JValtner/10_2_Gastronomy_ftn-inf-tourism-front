import { Tour } from "../../model/tour.model.js"
import { TourService } from "../../service/tour.service.js"
import { TourKeypointService } from "../../service/tourKeypoint.service.js"

const tourService = new TourService();
const tourKeypointService = new TourKeypointService();

function initializeForm(): void {
    const queryString = window.location.search
    const urlparams = new URLSearchParams(queryString)
    const id = urlparams.get('id')
    const action = urlparams.get('action')

    if (id) {
        tourService.getById(id)
            .then(tour => {
                (document.querySelector('#name') as HTMLInputElement).value = tour.name;
                (document.querySelector('#description') as HTMLInputElement).value = tour.description;
                (document.querySelector('#datetime') as HTMLInputElement).value = tour.dateTime;
                (document.querySelector('#maxGuests') as HTMLInputElement).value = tour.maxGuests.toString();

                if (tour.status === "u pripremi") {
                    (document.querySelector('#status') as HTMLInputElement).value = "Status: U pripremi";
                } else if (tour.status === "objavljena") {
                    (document.querySelector('#status') as HTMLInputElement).value = "Status: Objavljena";
                } else {
                    (document.querySelector('#status') as HTMLInputElement).value = "Status: Nepoznat";
                }

                const guideInput = document.querySelector('#guide') as HTMLInputElement | null
                if (guideInput) guideInput.value = tour.guide.username

                // If we are cloning, clear ID-related references so save creates new tour
                if (action === "clone") {
                    // Optionally tweak the name to indicate it's a copy
                    const nameInput = document.querySelector('#name') as HTMLInputElement
                    nameInput.value = tour.name + " (Copy)";

                    // Reset status always to "u pripremi" for clones
                    (document.querySelector('#status') as HTMLInputElement).value = "Status: U pripremi";
                }
            })
            .catch(error => {
                console.error(error.status, error.text)
            })
    } else {
        const guideInput = document.querySelector('#guide') as HTMLInputElement | null
        if (guideInput) guideInput.value = tourService.getName()
    }
}

function statusMsg(action: string): void {
    const status = document.getElementById('status-msg') as HTMLParagraphElement
    const text = document.getElementById('status-text') as HTMLSpanElement
    const bar = status.querySelector('.status-bar') as HTMLDivElement

    status.style.display = 'block'
    text.textContent = 'Postupak u toku...'

    bar.classList.remove('status-bar')
    void bar.offsetWidth
    bar.classList.add('status-bar')

    setTimeout(() => {
        text.textContent = action === "new"
            ? "Tura je uspešno kreirana."
            : "Tura je uspešno izmenjena."
    }, 4800)
}

function submit(event: Event): void {
    event.preventDefault()

    const name = (document.querySelector('#name') as HTMLInputElement).value
    const description = (document.querySelector('#description') as HTMLInputElement).value
    const datetime = (document.querySelector('#datetime') as HTMLInputElement).value
    const maxguests = (document.querySelector('#maxGuests') as HTMLInputElement).value
    const status = "u pripremi"
    const guideId = parseInt(localStorage.getItem("userId") || "0")

    if (!name || !description || !datetime || !maxguests || !guideId) {
        alert("All fields are required!")
        return
    }

    const formData: Tour = {
        name,
        description,
        dateTime: datetime,
        maxGuests: parseInt(maxguests),
        status: status,
        guideId: guideId,
    }

    const queryString = window.location.search
    const urlparams = new URLSearchParams(queryString)
    const id = urlparams.get('id')
    const actionParam = urlparams.get('action')

    let actionPromise: Promise<Tour>

    if (id && actionParam === "edit") {
        actionPromise = tourService.update(id, formData)
    } else if (id && actionParam === "clone") {
        actionPromise = tourService.addNew(formData).then((newTour: Tour) => {
            return tourKeypointService.cloneKeypointToTour(parseInt(id), newTour.id)
                .then(() => newTour)
        })
    } else {
        actionPromise = tourService.addNew(formData)
    }
    
    actionPromise
        .then((tour: Tour) => {
            statusMsg(id && actionParam === "edit" ? "edit" : "new")
            setTimeout(() => {
                window.location.href = `../tourFormKeypoints/tourFormKeypoints.html?tourId=${tour.id}`
            }, 5000)
        })
        .catch(error => {
            console.error(error.status, error.message || error.text)
        })
}


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

const fieldArray: string[] = ['name', 'description', 'datetime', 'maxGuests']
const fieldValid: { [key: string]: boolean } = {
    name: false,
    description: false,
    datetime: false,
    maxGuests: false
}

function validate(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement
    const errSpan = document.getElementById(`${id}-err`) as HTMLElement
    if (!input || !errSpan) return

    let errorMsg = ''
    const val = input.value.trim()

    if (id === 'name') {
        if (val.length < 5) {
            errorMsg = 'must be at leat 5 characters long.'
        }
    } else if (id === 'description') {
        if (val.length < 250) {
            errorMsg = 'must be at leat 250 characters long.'
        }
    } else if (id === 'datetime') {
        const inputDate = new Date(val)
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        if (!(inputDate > now)) {
            errorMsg = 'Datum mora biti u buducnosti.'
        }
    } else if (id === 'maxGuests') {
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
    const btn = document.getElementById('form-submit-Btn') as HTMLButtonElement
    const allValid = fieldArray.every(fieldId => {
        const input = document.getElementById(fieldId) as HTMLInputElement
        return input && input.value.trim() !== '' && fieldValid[fieldId]
    })

    btn.disabled = !allValid
}

// DOM Loaded
window.addEventListener("DOMContentLoaded", () => {
    initializeForm()
    tourService.getwelcome()
    attachTooltipTimeouts()

    const form = document.getElementById('form-data') as HTMLFormElement

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

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault()
            fieldArray.forEach(id => validate(id))
            submit(event)
        })
    }
})

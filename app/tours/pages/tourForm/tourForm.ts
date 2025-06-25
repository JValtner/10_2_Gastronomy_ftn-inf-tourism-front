
import { Tour } from "../../model/tour.model.js";
import { TourService } from "../../service/tour.service.js";

const tourService = new TourService()

function initializeForm(): void {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const id = urlparams.get('id');

    if (id) {
        tourService.getById(id)
            .then(tour => {
                
                (document.querySelector('#name') as HTMLInputElement).value = tour.name;
                (document.querySelector('#description') as HTMLInputElement).value = tour.description;
                (document.querySelector('#datetime') as HTMLInputElement).value = tour.dateTime;
                (document.querySelector('#maxGuests') as HTMLInputElement).value = tour.maxGuests.toString();
                (document.querySelector('#status') as HTMLInputElement).value = tour.status;
                (document.querySelector('#guide') as HTMLInputElement).value = tour.guide.username;
                (document.querySelector('#keypoints') as HTMLInputElement).value = tour.keypoints?.map(k => k.name).join(', ') || 'No keypoints';

            }).catch(error => {
                console.error(error.status, error.text);
            })
    }
    else{
        (document.querySelector('#guide') as HTMLInputElement).value = tourService.getName();
    }
}

function submit(event: Event): void {
    event.preventDefault(); 
   
    const name = (document.querySelector('#name') as HTMLInputElement).value
    const description = (document.querySelector('#description') as HTMLInputElement).value
    const datetime = (document.querySelector('#datetime') as HTMLInputElement).value
    const maxguests = (document.querySelector('#maxGuests') as HTMLInputElement).value
    const status = (document.querySelector('#status') as HTMLInputElement).value
    const guideId = parseInt(localStorage.getItem("userId") || "0");
    //TODO keypoints

    if (!name || !description || !datetime || !maxguests || !status || !guideId) {
        alert("All fields are required!");
        return;
    }

    const formData: Tour = {
        name,
        description,
        dateTime: datetime,
        maxGuests: parseInt(maxguests),
        status:status,
        guideId:guideId,
    };

    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const id = urlparams.get('id');

    const action = id ? tourService.update(id, formData) : tourService.addNew(formData);

    action
        .then(() => window.location.href = "../userTours/userTours.html")
        .catch(error => {
            console.error(error.status, error.message || error.text);
        });
}

const logout = document.querySelector('#logout') as HTMLAnchorElement;
logout.addEventListener("click", ()=>{
  localStorage.removeItem("user");
  window.location.href = "../../../users/pages/login/login.html";

})

document.addEventListener('DOMContentLoaded', ()=>{
    initializeForm();
    tourService.getwelcome()
    const button = document.querySelector("#form-submit-Btn");
    if (button) {
        button.addEventListener("click", submit)
    }
})

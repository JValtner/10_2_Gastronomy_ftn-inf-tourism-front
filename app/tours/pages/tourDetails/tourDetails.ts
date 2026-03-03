import { TourFeedbacks } from "../../model/tourFeedbacks.model.js";
import { FeedbacksServis } from "../../service/tourFeedbacks.service.js";
import { ReservationsServis } from "../../../tourReservations/service/reservations.service.js";
import { Tour } from "../../model/tour.model.js";
import { TourService } from "../../service/tour.service.js";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Keypoint } from "../../../keypoints/model/keypoint.model.js";

const reservationService = new ReservationsServis();
const tourFeedbacksService = new FeedbacksServis();
const tourService = new TourService();
const container = document.querySelector(".tour-details-container") as HTMLElement;

function renderTourData(tourId: string): void {
    tourService.getById(tourId)
        .then((response: Tour) => {
            const availableRoom = tourService.calculateAvailable(response);

            if (!container) {
                console.error("Container not found");
                return;
            }

            container.innerHTML = "";

            const tourInfoSection = document.createElement("div");
            tourInfoSection.classList.add("tour-info-section");
            tourInfoSection.innerHTML = `
                <section class="tour-title-section">
                    <div id="review-popup" class="review-popup hidden">
                        <div class="review-content">
                            <button class="close-review-btn" id="close-review-btn">✖</button>
                            <h2>Leave a Review</h2>
                            <label for="grade">Rating:</label>
                            <select id="grade">
                                <option value="">Select</option>
                                <option value="1">★☆☆☆☆</option>
                                <option value="2">★★☆☆☆</option>
                                <option value="3">★★★☆☆</option>
                                <option value="4">★★★★☆</option>
                                <option value="5">★★★★★</option>
                            </select>
                            <label for="comment">Comment:</label>
                            <textarea id="comment" placeholder="Your feedback..."></textarea>
                            <div class="tooltip bottom">
                                <button class="submit-review-btn" id="submit-review-btn">Submit</button>
                                <span class="tooltiptext">Oceni turu</span>
                            </div>     
                            <div class="form-row">
                                <div id="status-msg" class="status-msg" style="display: none;">
                                    <span id="status-text"></span>
                                    <div class="status-bar"></div>
                                </div>
                            </div>
                            <div class="form-row">
                                <p id="error-msg"></p>
                            </div>
                        </div>
                    </div>
                    <h1 class="tour-title">${response.name}</h1>
                    <div class="rate-btn-wrapper"><button class="rate-btn">Oceni turu</button></div>
                    <div class="reserve-btn-wrapper"><button class="reserve-btn">Rezervisi</button></div>
                    <div class="edit-btn-wrapper"><button class="edit-btn">Izmeni Turu</button></div>
                    <div class="delete-btn-wrapper"><button class="delete-btn">Obrisi Turu</button></div>
                </section>
                <section class="tour-images-section">
                    <div class="tour-images">
                        <div id="map"></div>
                        <img src="../../../assets/tour_preview.png" alt="Location Image" class="location-image">
                    </div>
                </section>
                <section class="tour-meta-section">
                    <div class="tour-meta">
                        <div class="meta-left">
                            <p><strong>Number of Guests:</strong> ${response.maxGuests}</p>
                            <p class="green"><strong>Still available:</strong> ${availableRoom}</p>
                            <p><strong>Guide Name:</strong> ${response.guide?.username ?? "Unknown"}</p>
                        </div>
                        <div class="meta-right">
                            <p><strong>Status:</strong> ${response.status}</p>
                            <p><strong>Date and Time:</strong> ${formatDate(response.dateTime)}</p>
                        </div>
                    </div>
                </section>
                <section class="tour-description-section">
                    <h2>Description</h2>
                    <p>${response.description}</p>
                </section>
            `;
            container.appendChild(tourInfoSection);

            const reserveBtn = container.querySelector(".reserve-btn-wrapper") as HTMLElement;
            const rateBtn = container.querySelector(".rate-btn-wrapper") as HTMLElement;
            const closeReviewBtn = document.getElementById("close-review-btn") as HTMLButtonElement;
            const submitReviewBtn = document.getElementById("submit-review-btn") as HTMLButtonElement;
            const editBtn = container.querySelector(".edit-btn-wrapper") as HTMLElement;
            const deleteBtn = container.querySelector(".delete-btn-wrapper") as HTMLElement;
            const role = localStorage.getItem("role");

            if (role === "turista") {
                editBtn.style.display = "none";
                deleteBtn.style.display = "none";

                reserveBtn.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    window.location.href = `../../../tourReservations/pages/tourReservationsForm/tourReservationsForm.html?tourId=${response.id}`;
                };

                rateBtn.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    openReviewPopup();
                };

                closeReviewBtn.onclick = () => {
                    closeReviewPopup();
                };

                submitReviewBtn.onclick = () => {
                    submitReview(response);
                };
            } else if (role === "vodic") {
                reserveBtn.style.display = "none";
                rateBtn.style.display = "none";

                editBtn.onclick = (event: MouseEvent) => {
                    event.stopPropagation();
                    window.location.href = `../tourForm/tourForm.html?id=${response.id}`;
                };

                deleteBtn.onclick = (event: MouseEvent) => {
                    event.stopPropagation();

                    const confirmed = window.confirm("Da li ste sigurni da zelite da obrisete turu?");
                    if (!confirmed) return;

                    tourService.delete(response.id.toString())
                        .catch(error => console.error(error.status, error.text));
                };
            } else {
                container.innerHTML = "<p>Korisnik nedefinisan. Molimo vas da se ulogujete.</p>";
                return;
            }

            const keypointSection = document.createElement("section");
            keypointSection.classList.add("keypoints-section");
            keypointSection.innerHTML = `<h2>Key Points in Tour</h2>`;

            const keypoints = Array.isArray(response.keyPoints) ? response.keyPoints : [];

            if (keypoints.length === 0) {
                keypointSection.innerHTML += "<p>No keypoints to show</p>";
            } else {
                for (const kp of keypoints) {
                    const kpBlock = document.createElement("div");
                    kpBlock.classList.add("keypoint");
                    kpBlock.innerHTML = `
                        <div class="keypoint-desc">
                            <p><strong>Name:</strong> ${kp.name}</p>
                            <p><strong>Latitude:</strong> ${kp.latitude}</p>
                            <p><strong>Longitude:</strong> ${kp.longitude}</p>
                            <p><strong>Description:</strong> ${trimText(kp.description)}</p>
                        </div>
                        <div class="keypoint-img">
                            <img src="${kp.imageUrl}" alt="Key Point Image" style="max-width:300px;">
                        </div>
                    `;

                    kpBlock.onclick = () => {
                        window.location.href = `../../../keypoints/pages/keypointDetails/keypointDetails.html?keypointId=${kp.id}`;
                    };

                    keypointSection.appendChild(kpBlock);
                }
            }

            container.appendChild(keypointSection);
            mapDisplay(keypoints);

            const feedbackSection = document.createElement("section");
            feedbackSection.classList.add("feedbacks-section");
            feedbackSection.innerHTML = `<h2>Feedbacks</h2>`;

            const feedbacks = Array.isArray(response.tourFeedbacks) ? response.tourFeedbacks : [];

            if (feedbacks.length === 0) {
                feedbackSection.innerHTML += "<p>No feedbacks yet.</p>";
            } else {
                for (const fb of feedbacks) {
                    const fbBlock = document.createElement("div");
                    fbBlock.classList.add("feedback");
                    fbBlock.innerHTML = `
                        <p><strong>Rating:</strong> ${"★".repeat(fb.userRating)}${"☆".repeat(5 - fb.userRating)}</p>
                        <p><strong>Comment:</strong> ${fb.userComment}</p>
                        <p><strong>Date:</strong> ${formatDate(fb.postedOn)}</p>
                    `;
                    feedbackSection.appendChild(fbBlock);
                }
            }

            container.appendChild(feedbackSection);

            const reservationSection = document.createElement("section");
            reservationSection.classList.add("reservations-section");
            reservationSection.innerHTML = `<h2>Reservations</h2>`;

            const reservations = Array.isArray(response.tourReservations) ? response.tourReservations : [];

            if (reservations.length === 0) {
                reservationSection.innerHTML += "<p>No reservations yet.</p>";
            } else {
                for (const res of reservations) {
                    const resBlock = document.createElement("div");
                    resBlock.classList.add("reservation");
                    resBlock.innerHTML = `
                        <p><strong>User ID:</strong> ${res.userId}</p>
                        <p><strong>Number of Guests:</strong> ${res.numberOfGuests}</p>
                        <button class="del-res-btn">Delete reservation</button>
                    `;

                    resBlock.querySelector(".del-res-btn")?.addEventListener("click", () => {
                        reservationService.delete(res.id.toString());
                        location.reload();
                    });

                    reservationSection.appendChild(resBlock);
                }
            }

            container.appendChild(reservationSection);
        })
        .catch(error => {
            console.error(error.status, error.message);
        });
}

function trimText(text: string, maxLength: number = 250): string {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function formatDate(isoDateString: string): string {
    const date = new Date(isoDateString);
    return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function openReviewPopup(): void {
    document.getElementById("review-popup")?.classList.remove("hidden");
}

function closeReviewPopup(): void {
    document.getElementById("review-popup")?.classList.add("hidden");
}

function submitReview(tour: Tour): void {
    const gradeSelect = document.getElementById("grade") as HTMLSelectElement | null;
    const commentTextarea = document.getElementById("comment") as HTMLTextAreaElement | null;

    if (!gradeSelect || !commentTextarea) {
        alert("Form elements not found.");
        return;
    }

    const grade = parseInt(gradeSelect.value, 10);
    const comment = commentTextarea.value.trim();

    if (isNaN(grade) || comment === "") {
        alert("Please fill out both fields.");
        return;
    }

    const loggedInUser = localStorage.getItem("userId");
    if (!loggedInUser) {
        alert("User not logged in.");
        return;
    }

    const formData: TourFeedbacks = {
        tourId: tour.id,
        userId: parseInt(loggedInUser, 10),
        userRating: grade,
        userComment: comment,
        postedOn: new Date().toISOString()
    };

    tourFeedbacksService.addNew(formData)
        .then(() => {
            statusMsg("new", grade, comment);
            gradeSelect.value = "";
            commentTextarea.value = "";
            renderTourData(tour.id.toString());
        })
        .catch(error => {
            console.error(error);
            const msg = document.getElementById("error-msg");
            if (msg) {
                msg.textContent = error.message || "Došlo je do greške prilikom ocenjivanja.";
            }
        });
}

function statusMsg(action: string, grade?: number, comment?: string): void {
    const status = document.getElementById("status-msg") as HTMLParagraphElement | null;
    const text = document.getElementById("status-text") as HTMLSpanElement | null;
    const bar = status?.querySelector(".status-bar") as HTMLDivElement | null;

    if (!status || !text || !bar) return;

    status.style.display = "block";
    text.textContent = "Postupak u toku...";

    bar.classList.remove("status-bar");
    void bar.offsetWidth;
    bar.classList.add("status-bar");

    setTimeout(() => {
        text.textContent = action === "new"
            ? "Uspešno poslato."
            : "Uspešno izmenjeno.";
    }, 4800);

    if (grade !== undefined && comment !== undefined) {
        console.log("Submitted:", { grade, comment });
    }

    closeReviewPopup();
}

function mapDisplay(keypoints: Keypoint[]): void {
    if (keypoints.length === 0) return;

    const map = L.map("map").setView(
        [keypoints[0].latitude, keypoints[0].longitude],
        13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const waypoints: L.LatLng[] = keypoints.map((kp) =>
        L.latLng(kp.latitude, kp.longitude)
    );

    map.fitBounds(L.latLngBounds(waypoints), {
        padding: [50, 50]
    });

    const plan = L.Routing.plan(waypoints, {
        createMarker: (i, wp, _n) =>
            L.marker(wp.latLng).bindPopup(
                `<b>${keypoints[i].name}</b><br>${keypoints[i].description}`
            ),
        addWaypoints: false,
        draggableWaypoints: false
    });

    const control = L.Routing.control({
        plan,
        router: L.Routing.osrmv1(),
        lineOptions: {
            styles: [{ color: "blue", weight: 4, opacity: 0.7 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
        },
        show: false,
        collapsible: false
    }).addTo(map);

    control.on("routesfound", (e: any) => {
        const route = e.routes?.[0];

        if (route?.bounds) {
            setTimeout(() => {
                map.fitBounds(route.bounds, { padding: [50, 50] });
            }, 100);
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const tourId = urlparams.get("tourId");

    if (tourId) {
        renderTourData(tourId);
    }
});
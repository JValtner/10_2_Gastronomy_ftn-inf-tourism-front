import { Keypoint } from "../../model/keypoint.model.js";
import { KeypointServis } from "../../service/keypoint.servis.js";
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const keypointService = new KeypointServis();
// render data

function renderData(): void {
  
  keypointService.getAll()
    .then((response: Keypoint[]) => {   
      const table = document.querySelector('table tbody');
      if (!table) {
        console.error('Table body not found');
        return;
      }

      table.innerHTML = '';

      for (const keypoint of response) {
        const newRow = document.createElement('tr');

        const cell1 = document.createElement('td');
        cell1.textContent = keypoint.name.toString();
        newRow.appendChild(cell1);

        //Details Button
        const cell2 = document.createElement('td');
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Detaljnije';
        detailsButton.style.width = 'auto';
        
        detailsButton.onclick = function () {
          event.stopPropagation();
        window.location.href = `../keypointDetails/keypointDetails.html?keypointId=${keypoint.id}`;
        };
        cell2.appendChild(detailsButton);
        newRow.appendChild(cell2);

        //Delete Button
        const cell3 = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.width = 'auto';

        deleteButton.onclick = function(){
        keypointService.delete(keypoint.id.toString())
            .then(() => {
            newRow.remove(); 
            })
            .catch(error => {
            console.error(error.status, error.text);
            });
        };
        cell3.appendChild(deleteButton);
        newRow.appendChild(cell3);

        table.appendChild(newRow);
      }
    })
    .catch(error => {
      console.error(error.status, error.message);
    });
}



//submit
function submit(event:Event): void {
    event.preventDefault(); 
    
    const Name = (document.querySelector('#name') as HTMLInputElement).value;
    const Description = (document.querySelector('#description') as HTMLInputElement).value;
    const Url = (document.querySelector('#url') as HTMLInputElement).value;
    const Longitude = (document.querySelector('#longitude') as HTMLInputElement).value;
    const Latitude = (document.querySelector('#latitude') as HTMLInputElement).value;
    
    const formData: Keypoint= {
    order: 1,
    name: Name,
    description: Description,
    imageUrl:Url,
    longitude:parseFloat(Longitude),
    latitude:parseFloat(Latitude),
  
  };

  keypointService.addNew(formData)
    .then(() => {
      statusMsg("new");
      setTimeout(() => {
      window.location.href ='#';
      location.reload();
     }, 3200);

  })
    .catch(error => {
      const errMsg = document.getElementById('err-msg') as HTMLParagraphElement;
      errMsg.textContent=`Doslo je do greske ${error.status, error.text}`
      console.error(error.status, error.message);
    });
}

//tolltips
function attachTooltipTimeouts() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltiptext') as HTMLElement;
        if (!tooltipText) return;

        let timeoutId: number | null = null;

        tooltip.addEventListener('mouseenter', () => {
        timeoutId = window.setTimeout(() => {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        }, 500); // show tooltip after 500ms
        });

        tooltip.addEventListener('mouseleave', () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        tooltipText.style.visibility = 'hidden';
        tooltipText.style.opacity = '0';
        });
    });
    }


//validate form
const fieldArray: string[] = ['name', 'description', 'url', 'longitude','latitude'];
const fieldValid: { [key: string]: boolean } = {
  name: false,
  description: false,
  url: false,
  longitude: false,
  latitude:false
};
function validate(id: string): void {
    const input = document.getElementById(id) as HTMLInputElement;
    const errSpan = document.getElementById(`${id}-err`) as HTMLElement;
    if (!input || !errSpan) return;

    let errorMsg = '';
    const val = input.value.trim();

    if (id === 'name') {
        if (val.length < 5) {
        errorMsg = 'must be at leat 5 characters long.';
        }
    } 
    if (id === 'description') {
        if (val.length < 250) {
        errorMsg = 'must be at leat 250 characters long.';
        }
    }

  if (errorMsg) {
  fieldValid[id] = false;
  input.style.border = '2px solid red';
  errSpan.textContent = errorMsg;
  errSpan.classList.add('visible');
} else {
  fieldValid[id] = true;
  input.style.border = '';
  errSpan.textContent = '';
  errSpan.classList.remove('visible');
}

  validateForm();
}

function validateForm(): void {
  const btn = document.getElementById('submit-btn') as HTMLButtonElement;
  const allValid = fieldArray.every(fieldId => {
    const input = document.getElementById(fieldId) as HTMLInputElement;
    return input && input.value.trim() !== '' && fieldValid[fieldId];
  });

  btn.disabled = !allValid;
}
function statusMsg(action: string): void {
  const status = document.getElementById('status-msg') as HTMLParagraphElement;
  const text = document.getElementById('status-text') as HTMLSpanElement;
  const bar = status.querySelector('.status-bar') as HTMLDivElement;

  status.style.display = 'block';
  text.textContent = 'Postupak u toku...';

  bar.classList.remove('status-bar');
  void bar.offsetWidth;
  bar.classList.add('status-bar');

  setTimeout(() => {
    text.textContent = action === "new"
      ? "Korisnik je uspešno kreiran."
      : "Korisnik je uspešno izmenjen.";
  }, 2800);
}

//Map coordinate picker
function mapCoordinatePicker() {
  const latitude = 45.254245;
  const longitude = 19.842881;

  // Initialize map
  const map = L.map('map').setView([latitude, longitude], 13);

  // Add OSM tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Get input fields
  const latInput = document.querySelector<HTMLInputElement>('#latitude');
  const lngInput = document.querySelector<HTMLInputElement>('#longitude');

  // Marker variable to update on click
  let marker: L.Marker | null = null;

  // Click event
  map.on('click', function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // after setting number values
if (latInput) {
  latInput.valueAsNumber = Math.round(lat * 1e6) / 1e6; // number with 6 decimals
  validate('latitude');               // update your fieldValid[] and inline styles
  latInput.setCustomValidity('');     // clear any custom validity
  latInput.reportValidity();          // force browser to re-evaluate :invalid immediately
}

if (lngInput) {
  lngInput.valueAsNumber = Math.round(lng * 1e6) / 1e6;
  validate('longitude');
  lngInput.setCustomValidity('');
  lngInput.reportValidity();
}

    // Add or move marker
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.marker([lat, lng]).addTo(map);
    }
  });
}
         
//display preview
function displayImg(): void {
  const img = document.querySelector("#img-preview") as HTMLImageElement;
  const urlInput = document.querySelector("#url") as HTMLInputElement;

  if (!img || !urlInput) 
    return;

  urlInput.addEventListener("input", () => {
    img.src = urlInput.value;
  });
}
//DOM Loaded
window.addEventListener("DOMContentLoaded", () => {
    displayImg();
    attachTooltipTimeouts();
    renderData();
    mapCoordinatePicker();

  // Attach onblur and on input validation for each input field
  fieldArray.forEach(id => {
  const input = document.getElementById(id) as HTMLInputElement;
  if (input) {
    input.addEventListener('input', () => validate(id)); // live validation
  }
  });

  const form = document.getElementById('keypoint-form') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      fieldArray.forEach(id => validate(id));
      submit(event);
    });
  }

});

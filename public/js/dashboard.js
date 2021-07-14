let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let mainSensorsDiv = document.getElementById("mainSensorsDiv");
let navbarLocationsDiv = document.getElementById('navbarLocationsDiv');

const giveTemplate = (data) => {

  // Template To be rendered for a particular sensor
  const giveDataOfSelectedLocation = ({
    id,
    location,
    time_of_reading,
    weight
  }) => {

    const place = location[1];
    mainSensorsDiv.innerHTML = `
            <div class="sensor-data-card" id=${id}>
                <p class="sensor-data-card-sensor-name">#ID: ${id}</p>
                <p class="sensor-data-card-sensor-value">Location: ${place}</p>
                <p class="sensor-data-card-sensor-weight">Weight: ${weight}</p>
                <p class="sensor-data-card-sensor-time"><i class="far fa-alarm-clock"></i> ${new Date(time_of_reading).toLocaleString()}</p>
            </div>`;
  };




  data.forEach((res) => {
    const { id, location } = res;
    var div = document.createElement("div");
    div.className = "location_card";
    div.tabIndex = 1;
    div.id = id;

    const state = location[0];
    const place = location[1];

    div.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

    div.onclick = function () {
      giveDataOfSelectedLocation(res);
    };
    mainLocationsDiv.appendChild(div);
  });

  // By default for First element 
  giveDataOfSelectedLocation(data[0]);

  data.forEach((res) => {
    const { id, location } = res;
    var div = document.createElement("div");
    div.className = "location_card";
    div.tabIndex = 1;
    div.id = id;

    const state = location[0];
    const place = location[1];

    div.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

    div.onclick = function () {
      giveDataOfSelectedLocation(res);
    };

    navbarLocationsDiv.appendChild(div);
  });


};

function checkedFunc(el) {
  var body = document.getElementsByTagName("BODY")[0];
  if (el.checked == true) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "visible";
  }
}


// Calling API
async function getRefreshData() {
  try {
    let response = await fetch("/call_data");
    let data = await response.json();
    // console.log(data)
    giveTemplate(data);
  } catch (err) {
    console.log(err);
  }
}


// Getting Refresh Data in every 2 minutes
getRefreshData();

setInterval(() => {

  // Making previous data empty , then we will store new data coming from backend
  mainLocationsDiv.innerHTML = "";
  navbarLocationsDiv.innerHTML = "";
  mainSensorsDiv.innerHTML = `<div class="loader"></div>`

  getRefreshData();
}, 2 * 60 * 1000);

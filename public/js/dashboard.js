let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let mainSensorsDiv = document.getElementById("mainSensorsDiv");

const giveTemplate = (data) => {

  // Template To be rendered for a particular sensor
  const giveDataOfSelectedLocation = ({
    id,
    location,
    time_of_reading,
    weight
  }) => {

    const state = location[0];
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

};

async function getRefreshData() {
  try {
    let response = await fetch("/call_data");
    let data = await response.json();
    console.log(data)
    giveTemplate(data);
  } catch (err) {
    console.log(err);
  }
}

getRefreshData();

setInterval(() => {
  // Making previous data empty , then we will store new data coming from backend
  mainLocationsDiv.innerHTML = "";
  mainSensorsDiv.innerHTML = `<div class="loader"></div>`
  getRefreshData();
}, 2 * 60 * 1000);

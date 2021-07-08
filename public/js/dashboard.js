let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let mainSensorsDiv = document.getElementById("mainSensorsDiv");

const giveTemplate = (data) => {
  const giveDataOfSelectedLocation = ({
    id,
    location,
    time_of_reading,
    weight
  }) => {
    mainSensorsDiv.innerHTML = `
  <div>
    <h3>ID: ${id}</h3>
    <p>Location: ${location}</p>
    <p>Time of reading: ${time_of_reading}</p>
    <p>Weight: ${weight}</p>
    </div>`;
  };

  giveDataOfSelectedLocation(data[0]);

  data.forEach((res) => {
    const { id, location, time_of_reading, weight } = res;
    var div = document.createElement("div");
    div.className = "location_card";
    div.id = id;

    div.innerHTML = `<h3>${location}</h3>`;

    div.onclick = function () {
      giveDataOfSelectedLocation(res);
    };

    mainLocationsDiv.appendChild(div);
  });
};

async function getRefreshData() {
  try {
    let response = await fetch("/call_data");
    let data = await response.json();
    giveTemplate(data);
  } catch (err) {
    console.log(err);
  }
}

getRefreshData();

setInterval(() => {
  getRefreshData();
}, 10 * 1000);


async function getAllSensors() {
	const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ geolocation: geolocation_id, user: geoUser }),
    };

    const response = await fetch("/getAllSensors", settings);
    const data = await response.json();
    console.log(data);
}

getAllSensors();
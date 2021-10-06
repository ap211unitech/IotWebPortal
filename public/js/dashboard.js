// All the required Global Variables-
let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let navbarLocationsDiv = document.getElementById("navbarLocationsDiv");
let geolocation_id = "";
let sensors_data;
let global_del_image_id = "";
let ratio = {};
let edit_ratio = {};
var addSensorBtnClicked = false;
var imgPos = [];
let image; // Global Variable to store image informtion.
let liveSensorData;
let idOfSensorWhichIsClicked = null;
$("#geoMap").fadeOut("fast");

// Add New User
document
  .querySelector("#createUserForm-submit-btn")
  .addEventListener("click", addNewUser);
async function addNewUser(e) {
  e.preventDefault();
  try {
    const email = document.getElementById("createUserForm-email").value;

    if (!email) {
      alert("Please enter a email address");
      return;
    }

    const me = await myDetails();
    let obj = {
      admin: "orghead",
      orghead: "user",
    };

    let formData = {
      email,
      type: obj[me.type],
    };

    console.log(formData);
    // return

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    let response = await fetch("/addUser", settings);
    let data = await response.json();

    if (data.status == 400) {
      alert(data.msg);
      return;
    } else {
      alert(`User Created successfully of type ${data.type}`);
      return;
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Logout User
document.querySelector("#logoutUser").addEventListener("click", logout);
async function logout() {
  try {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const myAllDetails = await fetch("/logout", settings);
    // const response = await myAllDetails.json();
    window.location.reload();
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Settings for diffrent type of users
async function settingsForDiffrentUser() {
  try {
    const currentUser = await myDetails();
    if (currentUser.type == "admin") {
      console.log("ADMIN");
    } else if (currentUser.type == "orghead") {
      console.log("ORG HEAD");
    } else if (currentUser.type == "user") {
      document.getElementById("addSensor-btn").style.display = "none";
      document.getElementById("add-new-btn").style.display = "none";
      document.getElementById("create-user-btn").style.display = "none";
      console.log("USER");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

settingsForDiffrentUser();

// MapBox API-
mapboxgl.accessToken =
  "pk.eyJ1IjoiYXJ5YW4wMTQxIiwiYSI6ImNrc21zbzJwaTBhMTYyb3A3MWpsd2M3eWQifQ.vH9l7ustzfMTQxOAcpfDww";

var map = new mapboxgl.Map({
  container: "geoMap",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [75.778885, 26.92207],
  zoom: 10,
});

// To check weather the Hamburger Nav is clicked or not-
function checkedFunc(el) {
  var body = document.getElementsByTagName("BODY")[0];
  if (el.checked == true) {
    body.style.overflow = "hidden";
  } else {
    body.style.overflow = "visible";
  }
}

// Refreshing the data in every 5sec-
function getRefreshData() {
  try {
    // let response = await fetch("/call_data");
    // let data = await response.json();
    $(".permanentMarker").remove();
    if (sensors_data == null) {
      return;
    }
    // console.log(sensors_data, "TMKB");

    getLiveSensorData();
    applyFilterForWeight();
    sensors_data.forEach((data) => {
      data.data.forEach((data) => {
        data.sensorDetail.forEach((res) => {
          updateDataOfSensorInTooltip(res);
        });
      });
    });
    // getGeolocation();
  } catch (err) {
    console.log(err);
  }
}
getGeolocation();
getLiveSensorData();
getRefreshData();

setInterval(() => {
  getRefreshData();
}, 5 * 1000);

// Get Live Sensor Data
async function getLiveSensorData() {
  const settings = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  let response = await fetch("/getLiveSensorData", settings);
  let data = await response.json();
  console.log(data);
  if (data == null) {
    liveSensorData = [];
    return;
  }

  liveSensorData = data;
  return;
}

function getSensorLiveDataUsingSensorID(sensorId) {
  let mainData;
  if (liveSensorData.length == 0 || liveSensorData == null) return null;
  liveSensorData.forEach((data) => {
    if (data.sensorId == sensorId) {
      // alert(data.distance);
      mainData = data;
      return;
    }
  });
  return mainData;
}

// Show sensors color according to the weight-
function sensorColorByWeight(weight) {
  if (weight < 25) {
    // Green
    return "rgb(0, 255, 127)";
  }
  if (weight >= 25 && weight < 50) {
    // Yellow
    return "rgb(255,255,49)";
  }
  if (weight >= 50 && weight < 75) {
    // Orange
    return "rgb(255,69,0)";
  }
  if (weight >= 75) {
    // Red
    return "rgb(220, 20, 60)";
  }
  return "rgb(255, 255, 255)";
}

// Show a particular sensor on the image map-
function showSensor(res) {
  var hRatio = res.imageCoordinates.hRatio;
  var vRatio = res.imageCoordinates.vRatio;
  var sensorSymbol = showThatSymbolOfSensor(res.sensorType);

  var sensorLiveData = getSensorLiveDataUsingSensorID(res.sensorId);
  var sensorLiveWeight;
  if (sensorLiveData == null || sensorLiveData.length == 0) {
    sensorLiveWeight = "x";
  } else {
    sensorLiveWeight = sensorLiveData.data[0].data;
  }
  // alert(sensorLiveWeight);
  // console.log(sensorLiveWeight,"Weight")

  var top = hRatio * $image.height() + imgPos[1];
  var left = vRatio * $image.width() + imgPos[0];

  $("body").append(
    $(
      '<div title="Click for more info" onclick="showDataOfSensor(this)" id="' +
        res._id +
        '" class="permanentMarker">' +
        sensorSymbol +
        "</div>"
    ).css({
      top: top - 29 + "px",
      left: left - 11 + "px",
      color: sensorColorByWeight(sensorLiveWeight),
      // fill: "black",
      // position: "relative",
      // width: "60%",
      // height: "100%",
      // backgroundColor: "blue",
    })
  );
}

// Function to show all the sensors on the Image Map-
function showAllTheSensorsOnImageMap(data) {
  if (data == null) return;
  data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        showSensor(res);
      });
    });
  });
}

// Function to show all the sensors on the Geo Map-
function showAllTheSensorsOnGeoMap(data) {
  // console.log(data);
  if (data == null) {
    return;
  }
  if (data[0] == null) return;
  $(".geoMarker").remove();
  data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        var lat = res.latitude;
        var lon = res.longitude;
        if (lat == "-1" || lon == "-1") {
          return;
        }
        var sensorSymbol = showThatSymbolOfSensor(res.sensorType);

        console.log(lat + " " + lon);

        var el = document.createElement("p");
        el.className = "geoMarker";
        el.innerHTML = sensorSymbol;
        el.style.color = sensorColorByWeight(87);
        // el.id = res._id;
        // el.onclick = function () {
        //   showDataOfSensor(el);
        // };

        // Add marker
        new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([lon, lat])
          .addTo(map);
      });
    });
  });

  var lat = data[0].data[0].sensorDetail[0].latitude;
  var lon = data[0].data[0].sensorDetail[0].longitude;
  if (lat == -1 || lon == -1) {
    return;
  }

  map.flyTo({
    center: [lon, lat],
    zoom: 12,
    bearing: 0,
    speed: 1.4, // make the flying slow
    curve: 1.8, // change the speed at which it zooms out
    easing: function (t) {
      return t;
    },
    essential: true,
  });
}

// Function which can give the hRatio & vRatio of the image-
function giveCoorsToImage() {
  $image = $("#inside-map");
  if (image == null) {
    return;
  }
  imgPos = [
    $image.offset().left,
    $image.offset().top,
    $image.offset().left + $image.outerWidth(),
    $image.offset().top + $image.outerHeight(),
  ];

  $image.mousemove(function (e) {
    $("#coords").html(
      (e.pageX - imgPos[0]).toFixed(0) + ", " + (e.pageY - imgPos[1]).toFixed(0)
    );
  });

  $image.click(function (ev) {
    if (addSensorBtnClicked == true) {
      var width_ratio = (ev.pageX - imgPos[0]) / $image.width();
      var height_ratio = (ev.pageY - imgPos[1]) / $image.height();

      ratio["hRatio"] = height_ratio;
      ratio["vRatio"] = width_ratio;
      console.log(height_ratio + " , " + width_ratio);

      $(".marker").remove(); // Removes the previous marker, when we select a new marker.

      $("body").append(
        $(
          '<div class="marker"><i class="fas fa-map-marker-alt"></i></div>'
        ).css({
          position: "absolute",
          top: ev.pageY - 29 + "px",
          left: ev.pageX - 11 + "px",
          fontSize: "1.8rem",
          color: "red",
        })
      );
      showAddSensorForm();
    }
  });
  $image.mouseenter(function () {
    $("html").css({ cursor: "crosshair" });
  });
  $image.mouseleave(function () {
    $("html").css({ cursor: "default" });
  });
}

// Show different sensor symbols according to their type-
function showThatSymbolOfSensor(text) {
  if (text == "Temperature") return '<i class="fas fa-temperature-high"></i>';
  if (text == "Humidity") return '<i class="fas fa-tint"></i>';
  if (text == "Light Intensity") return '<i class="fas fa-sun"></i>';
  if (text == "Heart Beat") return '<i class="fas fa-heartbeat"></i>';
  if (text == "Snow") return '<i class="fas fa-snowflake"></i>';
  if (text == "Gas Station") return '<i class="fas fa-gas-pump"></i>';
  if (text == "Gas Measure") return '<i class="fas fa-burn"></i>';
  if (text == "Garbage") return '<i class="fas fa-trash-alt"></i>';
  // if (text == "Pressure") return '<i class="fas fa-tachometer-alt"></i>';
  if (text == "Pressure") return '<i class="fas fa-tachometer-alt"></i>';
  if (text == "Bacteria") return '<i class="fas fa-bacteria"></i>';
  if (text == "Animals") return '<i class="fab fa-sticker-mule"></i>';
  if (text == "Location") return '<i class="fas fa-map-marker-alt"></i>';
  if (text == "Charging Station")
    return '<i class="fas fa-charging-station"></i>';
  if (text == "Water") return '<i class="fas fa-water"></i>';
  if (text == "Tint") return '<i class="fas fa-tint"></i>';
  // if (text == "Ultrasonic Sensor") return '<i class="fas fa-tint"></i>';
  if (text == "Ultrasonic Sensor")
    return '<i class="fas fa-satellite-dish"></i>';
}

// Function to show only a particular type of sensor on the image map-
function showThatTypeOfSensor(sensorType) {
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        if (res.sensorType == sensorType) {
          showSensor(res);
        }
      });
    });
  });
}

// Function to show sensor only for a particular weight-
function showSensorsAccordingToWeightOfThatType(low, high, sensorType) {
  var filter = sensorType == "All Sensors" ? false : true;
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        let sensorLiveData = getSensorLiveDataUsingSensorID(res.sensorId);
        if (sensorLiveData == null) {
          // showSensor(res);
          return;
        }
        if (filter) {
          if (
            sensorLiveData.distance >= low &&
            sensorLiveData.distance < high &&
            res.sensorType == sensorType
          ) {
            showSensor(res);
          }
        } else {
          if (
            sensorLiveData.distance >= low &&
            sensorLiveData.distance < high
          ) {
            showSensor(res);
          }
        }
      });
    });
  });
}

async function getGeolocationUserByGeoId(geoId) {
  try {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: geoId }),
    };

    const response = await fetch("/getUserIdbyGeoId", settings);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
}

// Get sensors detail of user
async function getSensorDetail(geolocation_id) {
  try {
    // Get Geolocation User Details
    let geoUser = (await getGeolocationUserByGeoId(geolocation_id)).user;
    let currentuser = await myDetails();

    // Checking Parent User Details
    // const currentUser = await myDetails();
    // let parentId = null;
    // if (currentUser.type != "admin") {
    //   parentId = (await parentUser(currentUser.email)).user;
    // }

    // console.log(geoUser)
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ geolocation: geolocation_id, user: geoUser }),
    };

    const response = await fetch("/getSensorgeolocation", settings);
    const data = await response.json();
    sensors_data = data;

    console.log(sensors_data, "sensor data");

    $("#inside-map").attr("src", "/img/loader.gif");
    const findImage = await fetch("/getImageUsingGeolocation", settings);
    const Image = await findImage.json();
    image = Image;
    console.log(Image, "image data");

    // If image is not found, then show the add image option.

    if (Image.length == 0 || Image.status == 400) {
      if (currentuser.type == "user") {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://icoconvert.com/images/noimage2.png",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        return;
      } else {
        $("#insideImage").css({ display: "block" });
        $("#inside-map").css({ display: "none" });
        $("#inside-map").attr({
          src: "https://icoconvert.com/images/noimage2.png",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        return;
      }
    }
    global_del_image_id = Image[0]._id;

    $("#insideImage").css({ display: "none" });
    $("#inside-map").css({ display: "block" });
    $("#geoMap").css({ display: "none" });
    $("#inside-map").attr("src", Image[0].name);
    $("#inside-map").attr("imageid", Image[0]._id);

    giveCoorsToImage();

    // giveCoorsToImage();

    // console.log(Image)
    // If sensor data is not found, then only show the uploaded image.
    if (data.status == 400) {
      console.log(data, "HERE");
      $("#insideImage").css({ display: "none" });
      $("#inside-map").css({ display: "block" });
      $("#inside-map").attr("src", Image[0].name);
      $("#inside-map").attr("imageid", Image[0]._id);

      return;
    }

    // showAllTheSensorsOnImageMap(sensors_data);
    applyFilterForWeight();
  } catch (err) {
    console.log(err);
    // alert('Something went wrong...');
  }
}

async function deleteGeolocation(geoId) {
  // Get Geolocation User Details
  let geoUser = (await getGeolocationUserByGeoId(geoId)).user;
  let currentuser = await myDetails();
  // alert("GeoID: " + geoId + " User: " + geoUser);

  // @Arjun Porwal - Write Backend Here
  const settings = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ geoId: geoId, user: geoUser }),
  };
  let response = await fetch("/deleteGeolocation", settings);
  let data = await response.json();
  window.location.reload();
  // return;
}

// Getting geolocations
async function getGeolocation() {
  try {
    // Checking Parent User Details
    const currentUser = await myDetails();
    let parentId = null;
    if (currentUser.type != "admin") {
      parentId = (await parentUser(currentUser.email)).user;
    }

    // Get geolocations

    // @ If currentUser is admin, he will get all geolocations in db
    // @ If currentUser is orghead, he will get geolocations created by him
    // @ If currentUser is user, he will get geolocations created by his parent (any orghead)

    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: parentId }),
    };
    $("#loaderGeolocations").css({ display: "block" });
    let response = await fetch("/getGeolocations", settings);
    let data = await response.json();
    $("#loaderGeolocations").css({ display: "none" });

    // If parent User is admin/orghead
    if (currentUser.type == "admin" || currentUser.type == "orghead") {
      if (data.status === 404) {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://icoconvert.com/images/noimage2.png",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        alert("Add a geolocation");
        return;
      }
    }

    // If parent User is admin/orghead
    if (currentUser.type == "user") {
      if (data.status === 404) {
        $("#insideImage").css({ display: "none" });
        $("#inside-map").css({ display: "block" });
        $("#inside-map").attr({
          src: "https://icoconvert.com/images/noimage2.png",
        });
        $("#geoMap").css({ display: "none" });
        $(".permanentMarker").remove();
        alert("There is no such geolocation created by your org head..");
        return;
      }
    }

    geolocation_id = data.allGeoLocations[0]._id;
    $("#geolocation-form").val(geolocation_id);
    console.log(geolocation_id);
    getSensorDetail(geolocation_id);

    $("#geolocation").val(geolocation_id);

    // Setting Geolocations For Left-Coloumn-
    data.allGeoLocations.forEach((res) => {
      var div = document.createElement("div");
      div.className = "location_card";
      div.tabIndex = 1;
      div.id = res._id;

      const state = res.location;
      const place = res.name;

      var div2 = document.createElement("div");
      div2.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

      if (currentUser.type == "admin" || currentUser.type == "orghead") {
        var div3 = document.createElement("div");
        div3.id = "deleteGeolocationBtn";
        div3.style.margin = "auto";
        div3.innerHTML = `<h2><i class="fas fa-trash"></i></h2>`;

        div3.onclick = function () {
          geolocation_id = res._id;
          deleteGeolocation(geolocation_id);
        };
      }

      div.appendChild(div2);
      div.appendChild(div3);

      div.onclick = function () {
        $(".permanentMarker").remove();
        geolocation_id = res._id;
        $("#geolocation-form").val(geolocation_id);
        getSensorDetail(geolocation_id);
      };
      mainLocationsDiv.appendChild(div);
    });

    // Setting Geolocations For Hamburger Navbar-
    data.allGeoLocations.forEach((res) => {
      var div = document.createElement("div");
      div.className = "location_card";
      div.tabIndex = 1;
      div.id = "hamNav" + res._id; // This is done, to prevent same id's for two div's.
      div.locationid = `${res._id}`;

      const state = res.location;
      const place = res.name;

      var div2 = document.createElement("div");
      div2.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

      if (currentUser.type == "admin" || currentUser.type == "orghead") {
        var div3 = document.createElement("div");
        div3.id = "deleteGeolocationBtn";
        div3.style.margin = "auto";
        div3.innerHTML = `<h2><i class="fas fa-trash"></i></h2>`;

        div3.onclick = function () {
          geolocation_id = res._id;
          deleteGeolocation(geolocation_id);
        };
      }

      div.appendChild(div3);

      // div.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

      div.onclick = function () {
        $(".permanentMarker").remove();
        geolocation_id = res._id;
        $("#geolocation-form").val(geolocation_id);
        // $("#check").checked = false;
        getSensorDetail(geolocation_id);
      };

      navbarLocationsDiv.appendChild(div);
    });
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// getGeolocation();

// Function to show ImageMap and Remove GeoMap-
function showImageMap() {
  // if(image.length == 0) {
  //   return;
  // }
  $(".permanentMarker").remove();
  $("#insideImage").css({ display: "none" });
  $("#inside-map").fadeIn("fast");
  // $('#geoMap').fadeOut('fast');
  $("#geoMap").css({ display: "none" });
  showAllTheSensorsOnImageMap(sensors_data);
}

// Function to show GeoMap and Remove Image Map-
function showGeoMap() {
  // $('#insideImage').fadeOut('fast');
  $("#insideImage").css({ display: "none" });
  // $('#inside-map').fadeOut('fast');
  $("#inside-map").css({ display: "none" });
  $("#geoMap").fadeIn("fast");
  $(".permanentMarker").remove();
  showAllTheSensorsOnGeoMap(sensors_data);
}

// Filter Funtions-
function applyFilter(el) {
  var val = el.value;
  var img = document.getElementById("inside-map");
  // Does not apply filters when Geo Map is open-
  if (img.style.display == "none") {
    alert("Currently Filters are only applicable to Image Map");
    return;
  }
  $(".permanentMarker").remove();
  if (val == "All Sensors") {
    showAllTheSensorsOnImageMap(sensors_data);
  } else {
    showThatTypeOfSensor(val);
  }
}

function applyFilterForWeight() {
  var img = document.getElementById("inside-map");
  if (img.style.display == "none") {
    // alert("Currently Filters are only applicable to Image Map");
    return;
  }
  if (sensors_data == null) return;
  var box25 = document.getElementById("25");
  var box50 = document.getElementById("50");
  var box75 = document.getElementById("75");
  var box100 = document.getElementById("100");
  var val = document.getElementById("filter-sensor-types").value;
  if (
    box25.checked == false &&
    box50.checked == false &&
    box75.checked == false &&
    box100.checked == false
  ) {
    // showAllTheSensorsOnImageMap(sensors_data);
    if (val == "All Sensors") {
      showAllTheSensorsOnImageMap(sensors_data);
    } else {
      showThatTypeOfSensor(val);
    }
  } else {
    $(".permanentMarker").remove();
    if (box25.checked == true) {
      showSensorsAccordingToWeightOfThatType(0, 25, val);
    }
    if (box50.checked == true) {
      showSensorsAccordingToWeightOfThatType(25, 50, val);
    }
    if (box75.checked == true) {
      showSensorsAccordingToWeightOfThatType(50, 75, val);
    }
    if (box100.checked == true) {
      showSensorsAccordingToWeightOfThatType(75, 10000, val);
    }
  }
}

// setTimeout(() => {
//   getSensorDetail();
// }, 3000);

// Many Functionalities
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $(".image-btn-and-dragger").hide();
      // $('.file-upload-btn').hide();
      $(".file-upload-content").show();

      $(".file-upload-image").attr("src", e.target.result);

      $(".image-title").html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);
  } else {
    removeUpload();
  }
}

function removeUpload() {
  $(".file-upload-input").replaceWith($(".file-upload-input").clone());
  $(".file-upload-content").hide();
  $(".image-btn-and-dragger").show();
  $(".file-upload-image").attr("src", "#");
  // $('.file-upload-btn').show();
}
$(".image-upload-wrap").bind("dragover", function () {
  $(".image-upload-wrap").addClass("image-dropping");
});
$(".image-upload-wrap").bind("dragleave", function () {
  $(".image-upload-wrap").removeClass("image-dropping");
});

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxx".replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

// It gives the complete detail of the sensor by the sensor id-
function getSensorDetailUsingSensorID(sensor_id) {
  let currSensorData;
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        if (res._id == sensor_id) {
          currSensorData = res;
        }
      });
    });
  });
  return currSensorData;
}

function showAddSensorForm() {
  $("#sensor-id").attr("value", create_UUID());
  $("#add-sensor-top-slider").slideDown("slow");
  $("#left-coloumn").css({ opacity: "0.4" });
  $("#right-coloumn").css({ opacity: "0.4" });
}

function showCreateUserForm() {
  $("#createUser").slideToggle("slow");
}

function createAlert(sensorData) {
  // if(sensors_data.length == 0 || image.length == 0) return;
  // $('#inside-map').css({ opacity: '0.5' });
  $("#emailAlertsTooltip").slideDown("slow");
}

function showEditSensorForm(sensor_id) {
  $("#edit-sensor-top-slider").slideDown("slow");
  $("#left-coloumn").css({ opacity: "0.4" });
  $("#right-coloumn").css({ opacity: "0.4" });
  var sensor_details = getSensorDetailUsingSensorID(sensor_id);
  edit_ratio = {
    hRatio: sensor_details.imageCoordinates.hRatio,
    vRatio: sensor_details.imageCoordinates.vRatio,
  };
  $("#edit-sensor-name-form").val(sensor_details.sensorName);
  $("#edit-sensor-location-form").val(sensor_details.location);
  $("#edit-sensor-id").val(sensor_details.sensorId);
  $("#edit-latitude").val(sensor_details.latitude);
  $("#edit-longitude").val(sensor_details.longitude);
  // console.log(sensor_details);
}

async function deleteSensor(sensor_id) {
  var sensorId = sensor_id;
  var geolocation = geolocation_id;
  var imageID = global_del_image_id;

  // Get Geolocation User Details
  const geoUser = (await getGeolocationUserByGeoId(geolocation)).user;

  const obj = {
    sensorId,
    geolocation,
    imageID,
    geoUser,
  };
  // console.log(obj)
  // return
  deleteSensorAPICall(obj);
}

function closeSlider() {
  $("#add-sensor-top-slider").slideUp("slow");
  $("#left-coloumn").css({ opacity: "1" });
  $("#right-coloumn").css({ opacity: "1" });
  $("#inside-map").css({ opacity: "1" });
  addSensorBtnClicked = false;
  $(".marker").remove();
}

function closeEditSensorForm() {
  $("#edit-sensor-top-slider").slideUp("slow");
  $("#left-coloumn").css({ opacity: "1" });
  $("#right-coloumn").css({ opacity: "1" });
}

function centerDivUsingID(div_id) {
  var w = screen.width / 2 - $("#" + div_id).width() / 2;
  var len = w.toString() + "px";
  document.getElementById(div_id).style.left = len;
}

// It takes the ADD SENSOR form exactly in the center of the frame.
centerDivUsingID("add-sensor-top-slider");

// It takes the EDIT SENSOR form exactly in the center of the frame.
centerDivUsingID("edit-sensor-top-slider");

// It takes the CREATE USER form exactly in the center of the frame.
centerDivUsingID("createUser");

// It takes the CREATE ALERT form exactly in the center of the frame.
centerDivUsingID("emailAlertsTooltip");

// Closses the slider, when we click outside that div and outside the image.
$(document).mouseup(function (e) {
  var container = $("#add-sensor-top-slider");
  var mapImage = $("#inside-map");
  var createUserForm = $("#createUser");
  var sensorDataTooltip = $(".sensorsDataDiv");
  var permanentMarkers = $(".permanentMarker");
  var edit_sensor_top_slider = $("#edit-sensor-top-slider");
  var emailAlertsTooltip = $("#emailAlertsTooltip");
  if (
    !container.is(e.target) &&
    container.has(e.target).length === 0 &&
    !mapImage.is(e.target) &&
    mapImage.has(e.target).length === 0
  ) {
    closeSlider();
  }
  if (
    !createUserForm.is(e.target) &&
    createUserForm.has(e.target).length === 0
  ) {
    createUserForm.slideUp("slow");
  }
  if (
    !sensorDataTooltip.is(e.target) &&
    sensorDataTooltip.has(e.target).length === 0 &&
    !permanentMarkers.is(e.target) &&
    permanentMarkers.has(e.target).length === 0
  ) {
    // removeDataOfSensor();
    $(".sensorsDataDiv").fadeOut("slow");
  }
  if (
    !edit_sensor_top_slider.is(e.target) &&
    edit_sensor_top_slider.has(e.target).length === 0
  ) {
    closeEditSensorForm();
  }
  if (
    !emailAlertsTooltip.is(e.target) &&
    emailAlertsTooltip.has(e.target).length === 0
  ) {
    $("#emailAlertsTooltip").slideUp("slow");
  }
});

function addSensorBtn() {
  if (image.length == 0) {
    return;
  }
  // if(sensors_data==null) return;
  $("#inside-map").css({ opacity: "0.5" });
  addSensorBtnClicked = true;
  // $('body').css({overflow: "hidden" });
}

async function showDataOfSensor(el) {
  idOfSensorWhichIsClicked = el.id;
  let currSensorData = getSensorDetailUsingSensorID(el.id);
  var hRatio = currSensorData.imageCoordinates.hRatio;
  var vRatio = currSensorData.imageCoordinates.vRatio;
  var sensorName = currSensorData.sensorName;
  var sensorId = currSensorData.sensorId;
  var sensorLocation = currSensorData.location;

  var top = hRatio * $image.height() + imgPos[1];
  var left = vRatio * $image.width() + imgPos[0];

  var sensorLiveData = getSensorLiveDataUsingSensorID(sensorId);

  var sensorLiveWeight;
  if (sensorLiveData == null) {
    sensorLiveWeight = "x";
  } else {
    sensorLiveWeight = sensorLiveData.data[0].data;
  }
  var sensorLiveTime =
    sensorLiveData == null || sensorLiveData.data[0].time == null
      ? "x"
      : sensorLiveData.data[0].time;

  $("#sensorNameTooltip").html(sensorName);
  $("#sensorIdTooltip").html("Id: " + sensorId);
  $("#sensorLocationTooltip").html(
    '<i class="fas fa-map-marker-alt"></i> ' + sensorLocation
  );
  $("#sensorWeightTooltip").html(sensorLiveWeight);
  // $("#sensorTimeTooltip").html('<i class="far fa-clock"></i> ' + "5:44PM | 21st May 2021");
  const date =
    sensorLiveTime == "x"
      ? "Invalid date"
      : new Date(sensorLiveTime).toDateString();
  const time =
    sensorLiveTime == "x"
      ? "Invalid time"
      : new Date(sensorLiveTime).toLocaleTimeString();
  $("#sensorTimeTooltip").html(
    '<i class="far fa-clock"></i> ' + date + " | " + time
  );

  // Anchor Tag to Edit the Sensor
  var editBtn = document.getElementById("editBtnTooltip");
  editBtn.onclick = function () {
    showEditSensorForm(el.id);
  };

  // // Anchor Tag to Delete the Sensor
  var deleteBtn = document.getElementById("deleteBtnTooltip");
  deleteBtn.onclick = function () {
    deleteSensor(el.id);
  };

  var createAlertBtn = document.getElementById("createAlertBtn");
  createAlertBtn.onclick = function () {
    createAlert(currSensorData);
  };

  const currentUser = await myDetails();
  if (currentUser.type == "user") {
    document.getElementById("editBtnTooltip").style.display = "none";
    document.getElementById("deleteBtnTooltip").style.display = "none";
    document.getElementById("createAlertBtn").style.display = "none";
    document.getElementById("lower-border").style.marginBottom = "15px";
  }

  $(".sensorsDataDiv").css({
    left: left + "px",
    top: top + "px",
  });

  $(".sensorsDataDiv").fadeIn("slow");
}

async function updateDataOfSensorInTooltip(currSensorData) {
  if (
    idOfSensorWhichIsClicked == null ||
    idOfSensorWhichIsClicked != currSensorData._id
  ) {
    // alert("Not Updated!");
    return;
  }

  var sensorId = currSensorData.sensorId;
  var sensorLiveData = getSensorLiveDataUsingSensorID(sensorId);
  // var sensorLiveData = getSensorLiveWeightUsingSensorID(res.sensorId);
  var sensorLiveWeight;
  if (sensorLiveData == null) {
    sensorLiveWeight = "x";
  } else {
    sensorLiveWeight = sensorLiveData.data[0].data;
  }
  var sensorLiveTime =
    sensorLiveData == null
      ? "x"
      : sensorLiveData.data[0].time;
  $("#sensorWeightTooltip").html(sensorLiveWeight);
  const date =
    sensorLiveTime == "x"
      ? "Invalid date"
      : new Date(sensorLiveTime).toDateString();
  const time =
    sensorLiveTime == "x"
      ? "Invalid time"
      : new Date(sensorLiveTime).toLocaleTimeString();
  $("#sensorTimeTooltip").html(
    '<i class="far fa-clock"></i> ' + date + " | " + time
  );
}

// API calling for adding a new sensor when user clicks Add Sensor button on popUp
document
  .querySelector("#add-sensor-btn")
  .addEventListener("click", addSensorAPICall);

async function addSensorAPICall(e) {
  e.preventDefault();
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const imageId = $("#inside-map").attr("imageid");
      const sensorName = document.getElementById("sensor-name-form").value;
      let latitude = document.getElementById("latitude").value;
      let longitude = document.getElementById("longitude").value;
      const location = document.getElementById("sensor-location-form").value;
      const sensorId = document.getElementById("sensor-id").value;
      let e = document.getElementById("sensor-categories");
      const category = e.options[e.selectedIndex].text;
      const geolocation = geolocation_id;
      e = document.getElementById("sensor-types");
      const sensorType = e.options[e.selectedIndex].text;

      if (latitude == "" || longitude == "") {
        latitude = -1;
        longitude = -1;
        // alert("TMLB");
      }

      const formData = {
        imageId,
        sensorName,
        latitude,
        longitude,
        sensorId,
        category,
        hRatio: ratio.hRatio,
        vRatio: ratio.vRatio,
        geolocation,
        location,
        sensorType,
      };

      const settings = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/addSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Edit Sensor
// API calling for adding a new sensor when user clicks Add Sensor button on popUp
document
  .querySelector("#edit-sensor-btn")
  .addEventListener("click", editSensorAPICall);

async function editSensorAPICall(e) {
  e.preventDefault();
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      // $("#edit-sensor-name-form").val(sensor_details.sensorName);
      // $("#edit-sensor-location-form").val(sensor_details.location);
      // $("#edit-sensor-id").val(sensor_details.sensorId);
      // $("#edit-latitude").val(sensor_details.latitude);
      // $("#edit-longitude").val(sensor_details.longitude);

      const imageId = $("#inside-map").attr("imageid");
      const sensorName = document.getElementById("edit-sensor-name-form").value;
      const latitude = document.getElementById("edit-latitude").value;
      const longitude = document.getElementById("edit-longitude").value;
      const location = document.getElementById(
        "edit-sensor-location-form"
      ).value;
      const sensorId = document.getElementById("edit-sensor-id").value;
      let e = document.getElementById("edit-sensor-categories");
      const category = e.options[e.selectedIndex].text;
      const geolocation = geolocation_id;
      e = document.getElementById("edit-sensor-types");
      const sensorType = e.options[e.selectedIndex].text;

      if (latitude == "" || longitude == "") {
        latitude = -1;
        longitude = -1;
        // alert("TMLB");
      }

      const formData = {
        imageId,
        sensorName,
        latitude,
        longitude,
        sensorId,
        category,
        hRatio: edit_ratio.hRatio,
        vRatio: edit_ratio.vRatio,
        geolocation,
        location,
        sensorType,
      };
      // console.log(formData)
      // return
      const settings = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/addSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Delete a sensor

async function deleteSensorAPICall(obj) {
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const formData = {
        geolocation: obj.geolocation,
        imageId: obj.imageID,
        sensorId: obj.sensorId,
        geoUser: obj.geoUser,
      };
      const settings = {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      };
      let response = await fetch("/deleteSensor", settings);
      let data = await response.json();
      console.log(data);
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Get Current User
async function myDetails() {
  try {
    const settings = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    const myAllDetails = await fetch("/me", settings);
    const response = await myAllDetails.json();
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// Get Parent User Detail
async function parentUser(email) {
  try {
    const formdata = { email };
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    };
    const myAllDetails = await fetch("/parentUser", settings);
    const response = await myAllDetails.json();
    console.log(response);
    return response;
  } catch (err) {
    console.log(err);
    alert("Something went wrong...");
  }
}

// setTimeout(() => {
//   console.clear();
// }, 5000);

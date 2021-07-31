let mainLocationsDiv = document.getElementById("mainLocationsDiv");
let navbarLocationsDiv = document.getElementById('navbarLocationsDiv');
let geolocation_id = "";
let sensors_data;

// To check weather the Hamburger Nav is clicked or not-
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
    // getGeolocation();
  } catch (err) {
    console.log(err);
  }
}


// Getting Refresh Data in every 2 minutes
getRefreshData();

setInterval(() => {
  // Making previous data empty , then we will store new data coming from backend
  // mainLocationsDiv.innerHTML = "";
  // navbarLocationsDiv.innerHTML = "";

  getRefreshData();
}, 2 * 60 * 1000);


// Get sensors detail of user
async function getSensorDetail(geolocation_id) {
  try {
    const settings = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ geolocation: geolocation_id })
    };
    const response = await fetch('/getSensorgeolocation', settings);
    const data = await response.json();
    sensors_data = data;
    console.log(data);

    const findImage = await fetch('/getImageUsingGeolocation', settings);
    const Image = await findImage.json();

    if (Image.length == 0 || Image.status == 400) {
      $('#insideImage').css({ 'display': 'block' });
      $('#inside-map').css({ 'display': 'none' });
      $('.permanentMarker').remove();
      return;
    }

    console.log(Image)

    if (data.status == 400) {
      $('#insideImage').css({ 'display': 'none' });
      $('#inside-map').css({ 'display': 'block' });
      $('#inside-map').attr("src", Image[0].name);
      $('#inside-map').attr("imageid", Image[0]._id);
      return;
    }

    $('#insideImage').css({ 'display': 'none' });
    $('#inside-map').css({ 'display': 'block' });
    $('#inside-map').attr("src", Image[0].name);
    $('#inside-map').attr("imageid", Image[0]._id);


    data.forEach((data) => {
      data.data.forEach((data) => {
        data.sensorDetail.forEach((res) => {
          var hRatio = res.imageCoordinates.hRatio;
          var vRatio = res.imageCoordinates.vRatio;

          var top = hRatio * ($image.height()) + imgPos[1];
          var left = vRatio * ($image.width()) + imgPos[0];

          $('body').append(
            $('<div onmouseover="showDataOfSensor(this)"  onmouseleave="removeDataOfSensor(this)" id="' + res._id + '" class="permanentMarker"><i class="fas fa-map-marker-alt"></i></div>').css({
              position: 'absolute',
              top: top - 29 + 'px',
              left: left - 11 + 'px',
              fontSize: '1.8rem',
              color: 'rgb(40, 40, 43)',
            })
          );
        });
      });
    });

  } catch (err) {
    console.log(err);
    // alert('Something went wrong...');
  }
}


// Getting geolocations
async function getGeolocation() {
  try {
    const settings = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };
    let response = await fetch('/getGeolocations', settings);
    let data = await response.json();

    if (data.status === 404) {
      alert('Add a geolocation');
      return;
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

      div.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

      div.onclick = function () {
        $('.permanentMarker').remove();
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
      div.id = "hamNav" + res._id;     // This is done, to prevent same id's for two div's.  
      div.locationid = `${res._id}`;

      const state = res.location;
      const place = res.name;

      div.innerHTML = `<h3>${place}</h3><p>${state}</p>`;

      div.onclick = function () {
        $('.permanentMarker').remove();
        geolocation_id = res._id;
        $("#geolocation-form").val(geolocation_id);
        getSensorDetail(geolocation_id);
      };

      navbarLocationsDiv.appendChild(div);
    });



  } catch (err) {
    console.log(err);
    alert('Something went wrong...');
  }
}

getGeolocation();

// setTimeout(() => {
//   getSensorDetail();
// }, 3000);

// Many Functionalities
function readURL(input) {
  if (input.files && input.files[0]) {

    var reader = new FileReader();

    reader.onload = function (e) {
      $('.image-btn-and-dragger').hide();
      // $('.file-upload-btn').hide();
      $('.file-upload-content').show();

      $('.file-upload-image').attr('src', e.target.result);


      $('.image-title').html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);

  } else {
    removeUpload();
  }
}

function removeUpload() {
  $('.file-upload-input').replaceWith($('.file-upload-input').clone());
  $('.file-upload-content').hide();
  $('.image-btn-and-dragger').show();
  $('.file-upload-image').attr('src', "#");
  // $('.file-upload-btn').show();
}
$('.image-upload-wrap').bind('dragover', function () {
  $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function () {
  $('.image-upload-wrap').removeClass('image-dropping');
});



function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

var addSensorBtnClicked = false;

function showAddSensorForm() {
  $("#sensor-id").attr("value", create_UUID());
  $('#add-sensor-top-slider').slideDown('slow');
  $("#left-coloumn").css({ opacity: '0.4' });
  $("#right-coloumn").css({ opacity: '0.4' });
}

function showCreateUserForm() {
  $('#createUser').slideToggle('slow');
}

function closeSlider() {
  $('#add-sensor-top-slider').slideUp('slow');
  $("#left-coloumn").css({ opacity: '1' });
  $("#right-coloumn").css({ opacity: '1' });
  $('#inside-map').css({ opacity: '1' });
  addSensorBtnClicked = false;
  $(".marker").remove();
  // $('body').css({overflow: "visible" });
}

// It takes the ADD SENSOR form exactly in the center of the frame.
var w = (screen.width) / 2 - $("#add-sensor-top-slider").width() / 2;
var len = w.toString() + "px";
document.getElementById('add-sensor-top-slider').style.left = len;


// It takes the CREATE USER form exactly in the center of the frame.
var w = (screen.width) / 2 - $("#createUser").width() / 2;
var len = w.toString() + "px";
document.getElementById('createUser').style.left = len;



// Closses the slider, when we click outside that div and outside the image.
$(document).mouseup(function (e) {
  var container = $("#add-sensor-top-slider");
  var mapImage = $('#inside-map');
  var createUserForm = $('#createUser');
  if (!container.is(e.target) && container.has(e.target).length === 0 && !mapImage.is(e.target) && mapImage.has(e.target).length === 0) {
    closeSlider();
  }
  if(!createUserForm.is(e.target) && createUserForm.has(e.target).length === 0) {
    createUserForm.slideUp('slow');
  }
});



function addSensorBtn() {
  $('#inside-map').css({ opacity: '0.5' });
  addSensorBtnClicked = true;
  // $('body').css({overflow: "hidden" });
}


let ratio = {};

// $(function () {
$image = $('#inside-map');
imgPos = [
  $image.offset().left,
  $image.offset().top,
  $image.offset().left + $image.outerWidth(),
  $image.offset().top + $image.outerHeight()
];

$image.mousemove(function (e) {
  $('#coords').html((e.pageX - imgPos[0]).toFixed(0) + ', ' + (e.pageY - imgPos[1]).toFixed(0));
});

$image.click(function (ev) {
  if (addSensorBtnClicked == true) {

    var width_ratio = (ev.pageX - imgPos[0]) / ($image.width());
    var height_ratio = (ev.pageY - imgPos[1]) / ($image.height());

    ratio["hRatio"] = height_ratio;
    ratio["vRatio"] = width_ratio;
    console.log(height_ratio + " , " + width_ratio);

    $(".marker").remove();    // Removes the previous marker, when we select a new marker.

    $('body').append(
      $('<div class="marker"><i class="fas fa-map-marker-alt"></i></div>').css({
        position: 'absolute',
        top: (ev.pageY - 29) + 'px',
        left: (ev.pageX - 11) + 'px',
        fontSize: '1.8rem',
        color: 'red',
      })
    );
    showAddSensorForm();
  }

});
$image.mouseenter(function () {
  $("html").css({ "cursor": "crosshair" });
});
$image.mouseleave(function () {
  $("html").css({ "cursor": "default" });
});



function showDataOfSensor(el) {
  let currSensorData;
  sensors_data.forEach((data) => {
    data.data.forEach((data) => {
      data.sensorDetail.forEach((res) => {
        if (res._id == el.id) {
          currSensorData = res;
        }
      });
    });
  });

  var hRatio = currSensorData.imageCoordinates.hRatio;
  var vRatio = currSensorData.imageCoordinates.vRatio;
  var sensorName = currSensorData.sensorName;
  var sensorId = currSensorData.sensorId;

  var top = hRatio * ($image.height()) + imgPos[1];
  var left = vRatio * ($image.width()) + imgPos[0];

  $('.sensorsDataDiv').remove();

  $('body').append(
    $('<div class="sensorsDataDiv"><h3>' + sensorName + '</h1> <p>Id: ' + sensorId + '</p></div>').css({
      top: top + 'px',
      left: left + 'px',
    }).fadeIn('slow')
  );

}

function removeDataOfSensor(el) {
  $('.sensorsDataDiv').fadeOut('slow');
}




// API calling for adding a new sensor when user clicks Add Sensor button on popUp
document.querySelector("#add-sensor-btn").addEventListener('click', addSensorAPICall);

async function addSensorAPICall(e) {
  e.preventDefault();
  try {
    if (geolocation_id == "") {
      alert("Select a Geolocation First");
      // break;
    } else {
      const imageId = $("#inside-map").attr("imageid");
      const sensorName = document.getElementById("sensor-name-form").value;
      const latitude = document.getElementById("latitude").value;
      const longitude = document.getElementById("longitude").value;
      const sensorId = document.getElementById("sensor-id").value;
      const e = document.getElementById("sensor-categories");
      const category = e.options[e.selectedIndex].text;
      const geolocation = geolocation_id;

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
      };

      const settings = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      };
      let response = await fetch("/addSensor", settings);
      let data = await response.json();
      console.log(data)
      window.location.replace("/dashboard");
    }
  } catch (err) {
    console.log(err);
    alert('Something went wrong...');
  }
}


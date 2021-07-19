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

function closeSlider() {
  $('#add-sensor-top-slider').slideUp('slow');
  $("#left-coloumn").css({ opacity: '1' });
  $("#right-coloumn").css({ opacity: '1' });
  $('#inside-map').css({ opacity: '1' });
  addSensorBtnClicked = false;
  $(".marker").remove();
  // $('body').css({overflow: "visible" });
}

// It takes the slider form exactly in the center of the frame.
var w = (screen.width) / 2 - $("#add-sensor-top-slider").width() / 2;
var len = w.toString() + "px";
document.getElementById('add-sensor-top-slider').style.left = len;



// Closses the slider, when we click outside that div and outside the image.
$(document).mouseup(function (e) {
  var container = $("#add-sensor-top-slider");
  var mapImage = $('#inside-map');
  if (!container.is(e.target) && container.has(e.target).length === 0 && !mapImage.is(e.target) && mapImage.has(e.target).length === 0) {
    closeSlider();
  }
});



function addSensorBtn() {
  $('#inside-map').css({ opacity: '0.5' });
  addSensorBtnClicked = true;
  // $('body').css({overflow: "hidden" });
}

// $(document).ready(function () {

// });

let ratio = {};

$(function () {
  $image = $('#inside-map');
  imgPos = [
    $image.offset().left,
    $image.offset().top,
    $image.offset().left + $image.outerWidth(),
    $image.offset().top + $image.outerHeight()
  ];

  $image.mousemove(function (e) {
    $('#coords').html((e.pageX - imgPos[0]) + ', ' + (e.pageY - imgPos[1]));
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
        $('<div class="marker"></div>').css({
          position: 'absolute',
          top: (ev.pageY - 7) + 'px',
          left: (ev.pageX - 7) + 'px',
          width: '15px',
          height: '15px',
          borderRadius: '100%',
          background: 'red',
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

});


// API calling when user clicks Add Sensor button on popUp
document.querySelector("#add-sensor-btn").addEventListener('click', addSensorAPICall);

async function addSensorAPICall(e) {
  e.preventDefault();
  try {
    const imageId = $("#inside-map").attr("imageid");
    const sensorName = document.getElementById("sensor-name-form").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    const sensorId = document.getElementById("sensor-id").value;
    const e = document.getElementById("sensor-categories");
    const category = e.options[e.selectedIndex].text;

    const formData = {
      imageId,
      sensorName,
      latitude,
      longitude,
      sensorId,
      category,
      hRatio: ratio.hRatio,
      vRatio: ratio.vRatio
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

  } catch (err) {
    console.log(err);
    alert('Something went wrong...');
  }
}


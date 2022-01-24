//local storage, helps sotre data
let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

//adding adding and deleting event command. Added Days of the week. These are local values that don't change. Adding a calendar refrence 
const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');
const eventTitleInput = document.getElementById('eventTitleInput');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


//weather API

var iconElement = document.querySelector(".image");
var tempElement = document.querySelector(".temp p");
var descElement = document.querySelector(".desc p");
var locationElement = document.querySelector(".city p");

var key = "0362bdb6062e171586847be4bbcbb408";

const weather = {};

//convert temperature to celcius
var KELVIN = 273;

weather.temperature = {
    unit : "celsius"
}

function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}




//geomapping for getting users locations
navigator.geolocation.getCurrentPosition(setPosition);


function setPosition(position){
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    
    getWeather(lat, lon);
}

//call for openweather api
function getWeather(lat, lon){
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`;
    
    fetch(api)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(function(){
            displayWeather();
        });
}

// display function
function displayWeather(){
    iconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather.iconId}@4x.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}`;
}
//end weather api

//clicking date function
function openModal(date) {
  clicked = date;

  const eventForDay = events.find(e => e.date === clicked);

  if (eventForDay) {
    document.getElementById('eventText').innerText = eventForDay.title;
    deleteEventModal.style.display = 'block';
  } else {
    newEventModal.style.display = 'block';
  }

  backDrop.style.display = 'block';
}
//using function that we did is easier rather then writing more code then required.
function load() {
  const dt = new Date();

  if (nav !== 0) {
    dt.setMonth(new Date().getMonth() + nav);
  }
  // these 3 lines are geting the actual day,year&month 
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  //Getting the day of the month the code was created, the date string is 
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  //US calendar 
  const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
    //passing information that we want, numrc is giving us the actual number of the date, rather then telling us in letters
    weekday: 'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  //varuable 
  const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

  document.getElementById('monthDisplay').innerText =
    `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;
  // continuing to get us the next month
  calendar.innerHTML = '';

  for (let i = 1; i <= paddingDays + daysInMonth; i++) {
    const daySquare = document.createElement('div');
    daySquare.classList.add('day');

    const dayString = `${month + 1}/${i - paddingDays}/${year}`;
    // giving the actual number of the day we are on
    if (i > paddingDays) {
      daySquare.innerText = i - paddingDays;
      const eventForDay = events.find(e => e.date === dayString);

      if (i - paddingDays === day && nav === 0) {
        daySquare.id = 'currentDay';
      }

      if (eventForDay) {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event');
        eventDiv.innerText = eventForDay.title;
        daySquare.appendChild(eventDiv);
      }
      //adding event listener for everytime the user clicks on the a sqaure 
      daySquare.addEventListener('click', () => openModal(dayString));
    } else {
      daySquare.classList.add('padding');
    }

    calendar.appendChild(daySquare);
  }
}

function closeModal() {
  eventTitleInput.classList.remove('error');
  newEventModal.style.display = 'none';
  deleteEventModal.style.display = 'none';
  backDrop.style.display = 'none';
  eventTitleInput.value = '';
  clicked = null;
  load();
}

function saveEvent() {
  if (eventTitleInput.value) {
    eventTitleInput.classList.remove('error');

    events.push({
      date: clicked,
      title: eventTitleInput.value,
    });

    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
  } else {
    eventTitleInput.classList.add('error');
  }
}

function deleteEvent() {
  events = events.filter(e => e.date !== clicked);
  localStorage.setItem('events', JSON.stringify(events));
  closeModal();
}
// event listener changing months, 
function initButtons() {
  document.getElementById('nextButton').addEventListener('click', () => {
    nav++;
    load();
  });

  document.getElementById('backButton').addEventListener('click', () => {
    nav--;
    load();
  });
  // event listener for task edits
  document.getElementById('saveButton').addEventListener('click', saveEvent);
  document.getElementById('cancelButton').addEventListener('click', closeModal);
  document.getElementById('deleteButton').addEventListener('click', deleteEvent);
  document.getElementById('closeButton').addEventListener('click', closeModal);
}


initButtons();
load();

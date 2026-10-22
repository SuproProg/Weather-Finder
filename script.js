const API_KEY = "42d506e4d104199784221c015f849991";
const DEFAULT_CITY = "London";

let currentUnit = localStorage.getItem("weather_temp_unit") || "C";
let cachedWeatherData = null;
let isSplashDismissed = false;

const splashScreen = document.getElementById("initialLoader");
const skipSplashBtn = document.getElementById("skipSplashBtn");
const weatherContainer = document.getElementById("weatherContainer");

const unitToggle = document.getElementById("unitToggle");
const unitC = document.getElementById("unitC");
const unitF = document.getElementById("unitF");

const cityInput = document.getElementById("cityInput");
const clearInputBtn = document.getElementById("clearInputBtn");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const loadingBox = document.getElementById("loadingBox");
const loadingMsg = document.getElementById("loadingMsg");

const errorBox = document.getElementById("errorBox");
const errorTitle = document.getElementById("errorTitle");
const errorDescription = document.getElementById("errorDescription");
const retryBtn = document.getElementById("retryBtn");

const weatherBox = document.getElementById("weatherBox");
const weatherDetails = document.getElementById("weatherDetails");

const cityName = document.getElementById("cityName");
const countryBadge = document.getElementById("countryBadge");
const dateTime = document.getElementById("dateTime");
const weatherImg = document.getElementById("weatherImg");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const weatherDescription = document.getElementById("weatherDescription");

const humidityVal = document.getElementById("humidityVal");
const windVal = document.getElementById("windVal");
const pressureVal = document.getElementById("pressureVal");
const visibilityVal = document.getElementById("visibilityVal");

function dismissSplash() {
  if (isSplashDismissed) return;
  isSplashDismissed = true;

  if (splashScreen) {
    splashScreen.classList.add("fade-out");
    if (weatherContainer) {
      weatherContainer.classList.add("app-ready");
    }
    setTimeout(() => {
      splashScreen.style.display = "none";
      splashScreen.setAttribute("aria-hidden", "true");
    }, 600);
  } else if (weatherContainer) {
    weatherContainer.classList.add("app-ready");
  }
}

const splashTimer = setTimeout(dismissSplash, 1200);

if (skipSplashBtn) {
  skipSplashBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearTimeout(splashTimer);
    dismissSplash();
  });
}

if (splashScreen) {
  splashScreen.addEventListener("click", () => {
    clearTimeout(splashTimer);
    dismissSplash();
  });
}

window.addEventListener("keydown", (e) => {
  if (
    !isSplashDismissed &&
    (e.key === "Escape" || e.key === "Enter" || e.key === " ")
  ) {
    clearTimeout(splashTimer);
    dismissSplash();
  }
});

function updateUnitToggleUI() {
  if (currentUnit === "C") {
    unitC.classList.add("active");
    unitF.classList.remove("active");
  } else {
    unitF.classList.add("active");
    unitC.classList.remove("active");
  }
}

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  localStorage.setItem("weather_temp_unit", currentUnit);
  updateUnitToggleUI();

  if (cachedWeatherData) {
    renderWeatherData(cachedWeatherData);
  }
});

updateUnitToggleUI();

function getWeatherVisuals(weatherMain) {
  const main = (weatherMain || "").toLowerCase();

  switch (main) {
    case "clear":
      return { image: "images/clear.png", bgClass: "clear-bg" };
    case "clouds":
      return { image: "images/cloud.png", bgClass: "clouds-bg" };
    case "rain":
    case "drizzle":
      return { image: "images/rain.png", bgClass: "rain-bg" };
    case "thunderstorm":
      return { image: "images/rain.png", bgClass: "thunderstorm-bg" };
    case "snow":
      return { image: "images/snow.png", bgClass: "snow-bg" };
    case "mist":
    case "smoke":
    case "haze":
    case "dust":
    case "fog":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return { image: "images/mist.png", bgClass: "mist-bg" };
    default:
      return { image: "images/clear.png", bgClass: "clouds-bg" };
  }
}

function updateBodyTheme(bgClass) {
  document.body.classList.remove(
    "clear-bg",
    "clouds-bg",
    "cloud-bg",
    "rain-bg",
    "drizzle-bg",
    "thunderstorm-bg",
    "snow-bg",
    "mist-bg",
    "haze-bg",
    "fog-bg",
    "smoke-bg",
    "dust-bg",
  );
  if (bgClass) {
    document.body.classList.add(bgClass);
  }
}

function showLoading(message = "Fetching live weather...") {
  loadingMsg.textContent = message;
  loadingBox.style.display = "flex";
  errorBox.classList.remove("active");
  weatherBox.classList.remove("active");
  weatherDetails.classList.remove("active");
}

function hideLoading() {
  loadingBox.style.display = "none";
}

function showError(title, description) {
  hideLoading();
  errorTitle.textContent = title;
  errorDescription.textContent = description;

  errorBox.classList.add("active");
  weatherBox.classList.remove("active");
  weatherDetails.classList.remove("active");
  updateBodyTheme(null);
}

function showWeather() {
  hideLoading();
  errorBox.classList.remove("active");
  weatherBox.classList.add("active");
  weatherDetails.classList.add("active");
}

function formatLocalDateTime(timezoneSeconds = 0) {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetDate = new Date(utcMs + timezoneSeconds * 1000);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[targetDate.getDay()];
  const monthName = months[targetDate.getMonth()];
  const dayNum = targetDate.getDate();

  let hours = targetDate.getHours();
  const minutes = targetDate.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${dayName}, ${monthName} ${dayNum} • ${hours}:${minutes} ${ampm}`;
}

function renderWeatherData(data) {
  cityName.textContent = data.city;
  if (data.country) {
    countryBadge.textContent = data.country;
    countryBadge.style.display = "inline-block";
  } else {
    countryBadge.style.display = "none";
  }

  dateTime.textContent = formatLocalDateTime(data.timezone);

  let displayTemp;
  let displayFeelsLike;
  let displayWind;

  if (currentUnit === "C") {
    displayTemp = `${Math.round(data.tempC)}<span>°C</span>`;
    displayFeelsLike = `Feels like ${Math.round(data.feelsLikeC)}°C`;
    displayWind = `${Math.round(data.windSpeedKmH)} Km/h`;
  } else {
    const tempF = Math.round(data.tempC * 1.8 + 32);
    const feelsF = Math.round(data.feelsLikeC * 1.8 + 32);
    const windMph = Math.round(data.windSpeedKmH * 0.621371);
    displayTemp = `${tempF}<span>°F</span>`;
    displayFeelsLike = `Feels like ${feelsF}°F`;
    displayWind = `${windMph} Mph`;
  }

  temperature.innerHTML = displayTemp;
  feelsLike.textContent = displayFeelsLike;
  weatherDescription.textContent = data.description;

  const visuals = getWeatherVisuals(data.weatherMain);
  weatherImg.src = visuals.image;
  updateBodyTheme(visuals.bgClass);

  humidityVal.textContent = `${data.humidity}%`;
  windVal.textContent = displayWind;
  pressureVal.textContent = `${data.pressure} hPa`;
  visibilityVal.textContent =
    data.visibilityKm !== "N/A" ? `${data.visibilityKm} Km` : "N/A";

  showWeather();
}

async function fetchWeather(url, searchContext) {
  if (!navigator.onLine) {
    showError(
      "You're Offline",
      "No internet connection detected. Please check your network and try again.",
    );
    return;
  }

  showLoading("Fetching live weather...");

  try {
    const response = await fetch(url);
    const json = await response.json();

    const code = String(json.cod);

    if (code === "404") {
      showError(
        "Location Not Found",
        `We couldn't find "${searchContext}". Please check the spelling and try again.`,
      );
      return;
    }

    if (code === "401") {
      showError(
        "API Key Notice",
        "The OpenWeatherMap API key is invalid or inactive. Please verify API configuration.",
      );
      return;
    }

    if (code === "429") {
      showError(
        "Rate Limit Exceeded",
        "Too many requests to the weather service. Please wait a minute and try again.",
      );
      return;
    }

    if (code !== "200") {
      showError(
        "Service Notice",
        json.message || "Unable to retrieve weather data at this time.",
      );
      return;
    }

    const weatherInfo = json.weather && json.weather[0] ? json.weather[0] : {};

    cachedWeatherData = {
      city: json.name || searchContext,
      country: json.sys ? json.sys.country : "",
      tempC: json.main.temp,
      feelsLikeC: json.main.feels_like,
      weatherMain: weatherInfo.main || "Clear",
      description: weatherInfo.description || "",
      humidity: json.main.humidity != null ? json.main.humidity : 0,
      windSpeedKmH:
        json.wind && json.wind.speed != null ? json.wind.speed * 3.6 : 0,
      pressure: json.main.pressure != null ? json.main.pressure : 1013,
      visibilityKm:
        json.visibility != null ? (json.visibility / 1000).toFixed(1) : "N/A",
      timezone: json.timezone || 0,
    };

    renderWeatherData(cachedWeatherData);
    localStorage.setItem("weather_last_city", cachedWeatherData.city);
  } catch (err) {
    console.error("Fetch weather error:", err);
    showError(
      "Connection Error",
      "Unable to connect to the weather service. Please check your connection and try again.",
    );
  }
}

function searchCity(cityQuery) {
  const query = cityQuery.trim();
  if (!query) {
    cityInput.classList.add("shake");
    cityInput.focus();
    setTimeout(() => cityInput.classList.remove("shake"), 400);
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    query,
  )}&units=metric&appid=${API_KEY}`;
  fetchWeather(url, query);
}

function searchByGeolocation() {
  if (!("geolocation" in navigator)) {
    showError(
      "Geolocation Unsupported",
      "Geolocation is not supported by your browser. You can still search for any city manually.",
    );
    return;
  }

  showLoading("Detecting your location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
      fetchWeather(url, "Your Location");
    },
    (err) => {
      console.warn("Geolocation warning:", err.message);
      let msg =
        "Location access was denied or unavailable. You can search any city by name.";
      if (err.code === 1) {
        msg =
          "Location permission denied. Please allow location access or search for a city manually.";
      } else if (err.code === 2) {
        msg = "Position unavailable. Please search for your city name.";
      }
      showError("Location Access", msg);
    },
    { timeout: 8000, enableHighAccuracy: false },
  );
}

searchBtn.addEventListener("click", () => {
  searchCity(cityInput.value);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchCity(cityInput.value);
  }
});

cityInput.addEventListener("input", () => {
  if (cityInput.value.trim().length > 0) {
    clearInputBtn.classList.add("visible");
  } else {
    clearInputBtn.classList.remove("visible");
  }
});

clearInputBtn.addEventListener("click", () => {
  cityInput.value = "";
  clearInputBtn.classList.remove("visible");
  cityInput.focus();
});

locationBtn.addEventListener("click", searchByGeolocation);

retryBtn.addEventListener("click", () => {
  errorBox.classList.remove("active");
  cityInput.focus();
  cityInput.select();
});

(function initApp() {
  const savedCity = localStorage.getItem("weather_last_city");
  const initialCity = savedCity || DEFAULT_CITY;
  searchCity(initialCity);
})();

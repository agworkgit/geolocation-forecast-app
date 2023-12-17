// TO DO:
// 1. When the user types a city in the input, call the weather API and show the result in HTML
//    1. Add an event listener to the form submit
//    2. Get the user input from the input value
//    3. Build the API query URL based on the user input value, change units to metric
//    4. Call the API and render the result in HTML
//       1. Get the city name and show it in the main weather forecast card
//       2. Get the first weather forecast item and the following values
//          -- date
//          -- temperature
//          -- wind speed
//          -- humidity
//          -- icon ex: weather.weather[0].icon
//       3. Render values to the main card
//       4. Loop through all weather arrays and get the following values
//          -- date
//          -- temperature
//          -- wind speed
//          -- humidity
//          -- icon ex: weather.weather[0].icon
// 2. When the user searches for a city, store it in localStorage
// 3. On the initial page load, load the search history and show it as a list (li) in HTML
//    - Sub-steps in 1 will be used again here
//    - Build the API query URL based on the history stored in local storage
//    - Call the API and render results
// 4. When the user clicks on the search history, call the weather API and show the results
// 5. Style the layout

// Open Weather API https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Geocoding API https://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// API Key 4d7081df4ecfa66c38a6adb2ad1b0ebd

// Wait for the document to be ready before executing the code
$(document).ready(function () {
  // Select elements using jQuery
  const searchCityBtn = $(".search-city");
  const userInput = $(".user-input");
  const savedSearches = $(".saved-searches");

  // Default location in case geolocation is not available
  const defaultLocation = "London";

  // Check if the browser supports geolocation??
  if (navigator.geolocation) {
    // Use geolocation API to get the user's access location
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Fetch the weather data using obtained latitude and longitude
        fetchWeatherDataByCoords(latitude, longitude);
      },
      function (error) {
        // Handle geolocation errors or use a default location
        console.error("Geolocation error:", error);
        fetchDefaultWeatherData();
      }
    );
  } else {
    // Geolocation not supported, use default location above
    fetchDefaultWeatherData();
  }

  // Event listener for the search button click
  searchCityBtn.on("click", function (event) {
    event.preventDefault();
    const targetLocation = userInput.val();

    if (targetLocation) {
      // Use the user-provided location for the weather data
      fetchWeatherDataByLocation(targetLocation);
    } else {
      // Handle the case when the input is empty
      console.log("Please enter a city before searching.");
    }
  });

  // Event listener for the Enter key press on the input field, an extra in case the preference is enter key instead of click
  userInput.on("keypress", function (event) {
    // Check if the pressed key is Enter (key code 13)?
    if (event.which === 13) {
      // Prevent the default form submission behavior
      event.preventDefault();

      // Trigger the same action as the search button click
      searchCityBtn.trigger("click");
    }
  });

  // Event listener for clicking on a saved search
  savedSearches.on("click", ".search-city-saved", function () {
    const targetLocation = $(this).text();
    // Fetch weather data for the clicked saved search button (in grey)
    fetchWeatherDataByLocation(targetLocation);
  });

  // Function to fetch weather data using coordinates
  function fetchWeatherDataByCoords(latitude, longitude) {
    const apiKey = "4d7081df4ecfa66c38a6adb2ad1b0ebd";
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    // Fetch weather data and update UI
    fetchWeatherData(queryURL);
  }

  // Function to fetch weather data using a location name
  function fetchWeatherDataByLocation(location) {
    const apiKey = "4d7081df4ecfa66c38a6adb2ad1b0ebd";
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      location
    )}&appid=${apiKey}&units=metric`;

    // Fetch weather data and update UI
    fetchWeatherData(queryURL);
  }

  // Function to fetch weather data using a default location
  function fetchDefaultWeatherData() {
    const apiKey = "4d7081df4ecfa66c38a6adb2ad1b0ebd";
    const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      defaultLocation
    )}&appid=${apiKey}&units=metric`;

    // Fetch weather data and update UI
    fetchWeatherData(queryURL);
  }

  // Function to fetch weather data from the API
  function fetchWeatherData(queryURL) {
    fetch(queryURL)
      .then(handleErrors) // Added error handling
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        // Update the UI with the fetched weather data
        updateWeatherUI(data);

        // Save the search to localStorage if it's not already saved
        const searchValue = userInput.val();
        if (!isCityAlreadySaved(searchValue)) {
          saveToLocalStorage(searchValue);
          // Update the saved searches list only if it's a new search
          updateSavedSearches();
        }
      })
      .catch(function (error) {
        // Handle fetch errors, including misspelled city names
        console.log("Fetch error:", error);
        handleFetchError();
      });
  }

  // Function to handle errors in the fetch request
  function handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  // Function to handle fetch errors, such as misspelled city names
  function handleFetchError() {
    // Display an error message in the input field placeholder
    userInput.val(""); // Clear the input value
    userInput.attr("placeholder", "You misspelled the city name, try again");

    // Set a timeout to change the placeholder back to the default value after a few seconds
    setTimeout(function () {
      userInput.attr("placeholder", "Type the city");
    }, 3000); // Change back after 3 seconds
  }

  // Function to check if a city is already saved
  function isCityAlreadySaved(city) {
    const searches = JSON.parse(localStorage.getItem("searches")) || [];
    return searches.includes(city);
  }

  // Function to update the UI with weather data
  function updateWeatherUI(weatherData) {
    // Update main weather card
    const mainInfoPanel = $(".main-info-panel");
    mainInfoPanel
      .find(".main-info-title")
      .text(`The weather for ${weatherData.city.name} on`);

    // Update with custom icons
    const weatherIconCode = weatherData.list[0].weather[0].icon;
    const partialFileName = getCustomIconFileName(weatherIconCode);
    const customIconPath = `images/weather-conditions/${partialFileName}.svg`;
    mainInfoPanel.find(".current-icon").attr("src", customIconPath);

    const currentDay = dayjs().format("dddd");
    mainInfoPanel.find(".current-day").text(currentDay);
    mainInfoPanel.find(".current-date").text(dayjs().format("DD/MM/YYYY"));
    const temperature = weatherData.list[0].main.temp;
    mainInfoPanel
      .find(".current-temp")
      .text(`${temperature > 0 ? "+" : ""}${temperature} C`);

    mainInfoPanel
      .find(".current-wind")
      .text(`Wind Speed: ${weatherData.list[0].wind.speed} m/s`);
    mainInfoPanel
      .find(".current-humidity")
      .text(`Humidity: ${weatherData.list[0].main.humidity}%`);

    // Update weekly forecast
    const weeklyForecast = $(".weekly-forecast");
    weeklyForecast.empty(); // Clear previous cards

    for (let i = 1; i < 6; i++) {
      const weatherCard = $("<div>").addClass("weather-card");
      const textInfo = $("<div>").addClass("text-info");
      const iconInfo = $("<div>").addClass("icon-info-weekly");

      textInfo.append(
        `<p class="current-day">${dayjs().add(i, "day").format("dddd")}</p>`
      );
      textInfo.append(
        `<p class="current-date">${dayjs()
          .add(i, "day")
          .format("DD/MM/YYYY")}</p>`
      );
      textInfo.append(
        `<p class="current-temp">Temperature: ${weatherData.list[i].main.temp} C</p>`
      );
      textInfo.append(
        `<p class="current-wind">Wind Speed: ${weatherData.list[i].wind.speed} m/s</p>`
      );
      textInfo.append(
        `<p class="current-humidity">Humidity: ${weatherData.list[i].main.humidity}%</p>`
      );

      // Update the weather card icon
      const cardCustomIconPath = `images/weather-conditions/${getCustomIconFileName(
        weatherData.list[i].weather[0].icon
      )}.svg`;
      iconInfo.append(
        `<img class="weather-icon" src="${cardCustomIconPath}" alt="Weather Icon">`
      );

      weatherCard.append(textInfo);
      weatherCard.append(iconInfo);

      weeklyForecast.append(weatherCard);
    }
  }

  // Function to get the custom icon file name based on OpenWeatherMap icon codes
  function getCustomIconFileName(iconCode) {
    const iconFileMap = {
      "01d": "sunny",
      "01n": "clear_night",
      "02d": "partly_cloudy_day",
      "02n": "partly_cloudy_night",
      "03d": "cloudy",
      "03n": "cloudy",
      "04d": "cloudy",
      "04n": "cloudy",
      "09d": "rainy",
      "09n": "rainy",
      "10d": "rainy_heavy",
      "10n": "rainy_heavy",
      "11d": "thunderstorm",
      "11n": "thunderstorm",
      "13d": "snowing",
      "13n": "snowing",
      "50d": "foggy",
      "50n": "foggy",
    };

    const partialFileName = iconFileMap[iconCode] || "generic";
    const fullFileName = `${partialFileName}_FILL0_wght400_GRAD0_opsz24`;

    return fullFileName;
  }

  // Function to save a city to localStorage
  function saveToLocalStorage(city) {
    if (city.trim() !== "") {
      const searches = JSON.parse(localStorage.getItem("searches")) || [];
      if (!searches.includes(city)) {
        searches.push(city);
        localStorage.setItem("searches", JSON.stringify(searches));
        updateSavedSearches();
      }
    }
  }

  // Function to update the saved searches list in the UI
  function updateSavedSearches() {
    savedSearches.empty();
    const searches = JSON.parse(localStorage.getItem("searches")) || [];
    searches.forEach(function (city) {
      const searchBtn = $("<button>").addClass("search-city-saved").text(city);
      savedSearches.prepend(searchBtn);
    });
  }

  // Load saved searches on the initial page load
  updateSavedSearches();
});

// Function to handle errors in the fetch request (outside of the document ready block)
function handleErrors(response) {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

document.addEventListener("deviceready", function () {
  loadFavorites();
  document.getElementById("weatherBtn").addEventListener("click", function () {
    const location = document.getElementById("locInput").value;
    if (location) {
      getCoordinates(location);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
  });

  function onSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeather(lat, lon);
  }

  function onError(error) {
    alert("Error getting location: " + error.message);
  }

  function getCoordinates(location) {
    const apiKey = "40e328eb9c617d16e18b6633185f5779";
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          fetchWeather(data[0].lat, data[0].lon);
        } else {
          alert("Location not found");
        }
      })
      .catch((error) => {
        alert("Error fetching coordinates: " + error.message);
      });
  }

  function fetchWeather(lat, lon) {
    const apiKey = "40e328eb9c617d16e18b6633185f5779";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        displayWeather(data);
      })
      .catch((error) => {
        alert("Error fetching weather data: " + error.message);
      });
  }

  function displayWeather(data) {
    const weatherDetails = document.getElementById("weatherDetails");

    weatherDetails.innerHTML = `
      <p>Location: <span style="color: blue; font-weight: bold;">${data.name}</span></p>
      <p>Temperature: <span style="color: red;">${data.main.temp}°C</span></p>
      <p>Weather: <span style="text-transform: capitalize;">${data.weather[0].description}</span></p>
      <button id="saveLocationBtn">Save Location</button>
    `;

    document.getElementById('saveLocationBtn').addEventListener('click', function () {
      saveLocation(data.name, data.coord.lat, data.coord.lon);
      loadFavorites();
    });
  }

  function saveLocation(name, lat, lon) {
    // Retrieve existing favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Check if the location already exists
    const exists = favorites.some(fav => fav.name === name && fav.lat === lat && fav.lon === lon);
    if (!exists) {
      // Add the new location to the array
      favorites.push({ name, lat, lon });
      
      // Save the updated array back to localStorage
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // Save to file
      saveToFile(favorites);
    } else {
      alert('Location already saved');
    }
  }

  function saveToFile(favorites) {
    const data = JSON.stringify(favorites, null, 2);
    
    const fileName = "weatherData.json";
    const directory = cordova.file.externalDataDirectory; 

    window.resolveLocalFileSystemURL(directory, 
        function (dirEntry) {
        dirEntry.getFile(fileName, { create: true, exclusive: false }, 
            function (fileEntry) {
            fileEntry.createWriter(
                function (fileWriter) {
                fileWriter.onwriteend = function () {
                    alert("Data saved to " + fileEntry.nativeURL);
                };

                fileWriter.onerror = function (e) {
                    console.error("Failed to write file: " + e.toString());
                };

                const blob = new Blob([data], { type: "application/json" });
                fileWriter.write(blob);
            }, onError);
        }, onError);
    }, onError);
  }

  function loadFavorites() {
    // Retrieve favorites from localStorage
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
    // Display the favorites (you can modify this part to fit your UI)
    const favoritesList = document.getElementById('favoritesList');
    favoritesList.innerHTML = '';
  
    favorites.forEach(fav => {
      const listItem = document.createElement('li');
      listItem.textContent = `${fav.name} (${fav.lat}, ${fav.lon})`;
      favoritesList.appendChild(listItem);
    });
  }  

  function onError(error) {
    alert("Error: " + error.message);
  }

});

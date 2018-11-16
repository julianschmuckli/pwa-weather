function addLocation() {
    var location = document.getElementById("new_location").value;

    if (location == "") {

    } else {
        if (navigator.onLine) {
            fetch("https://api.openweathermap.org/data/2.5/weather?q=" + location + "&appid=" + API_KEY + "&units=metric", {
                method: "GET"
            }).then(function (data) {
                try {
                    data.json().then(function (json) {
                        if (json.cod == 200) {
                            try {
                                //Check if location is not already in IndexedDB.
                                IndexDB.transaction(["location-data"]).objectStore("location-data").getAll().onsuccess = function (event) {
                                    var is_already_registerd = false;
                                    event.target.result.forEach(function (curr) {
                                        if (curr == json.id) {
                                            is_already_registerd = true;
                                        }
                                    });
                                    if (!is_already_registerd) {
                                        var tx_location_data = IndexDB.transaction('location-data', 'readwrite');
                                        var location_data_location = tx_location_data.objectStore("location-data");

                                        location_data_location.put(json.id, json.id);
                                        getData(showTemperature);
                                    } else {
                                        M.toast({html: 'This is city is already in your list.'});
                                    }
                                };
                            } catch (e) {
                                console.log(e);
                            }
                        } else if (json.cod == 429) {
                            M.toast({html: 'API Limit exceeded.'});
                        } else {
                            M.toast({html: 'City was not found. Try another name.'});
                        }
                    });
                } catch (e) {
                    M.toast({html: 'Error while parsing JSON: ' + e});
                }
            });
        } else {
            var tx_location_data = IndexDB.transaction('temp-location-data', 'readwrite');
            var location_data_location = tx_location_data.objectStore("temp-location-data");

            location_data_location.add(location, guid());

            document.getElementById("new_location").value = "";

            navigator.serviceWorker.ready.then(function (swRegistration) {
                return swRegistration.sync.register('insertTempLocations');
            });

            M.toast({html: "Your location will be added as soon as you will be back online."});

            showOfflineLocations();
        }
    }

    return false;
}

function activateNotification() {
    Notification.requestPermission(function (status) {
        if (status == "granted") {
            M.toast({html: "Notifications has been enabled."});
        } else if (status == "default") {
            M.toast({html: "The notification permission request has been dismissed"});
        } else if (status == "denied") {
            M.toast({html: "Notifications has been turned off."});
        }
    });
}

function deleteCity(id) {
    IndexDB.transaction(["location-data"], 'readwrite').objectStore("location-data").delete(id).onsuccess = function (event) {
        IndexDB.transaction(["weather-data"], 'readwrite').objectStore("weather-data").delete(id).onsuccess = function (event) {
            M.toast({html: 'City deleted'});

            clearContainer();
            showTemperature();
        };
    };
}
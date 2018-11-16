function getData(callback) {
    if (navigator.onLine) {

        IndexDB.transaction(["location-data"]).objectStore("location-data").getAll().onsuccess = function (event) {
            event.target.result.forEach(function (id) {
                fetch("https://api.openweathermap.org/data/2.5/weather?id=" + id + "&appid=" + API_KEY + "&units=metric", {
                    method: "GET"
                }).then(function (data) {
                    try {
                        data.json().then(function (json) {
                            console.log(json);
                            if (json.cod == 200) {
                                var tx_weather_data = IndexDB.transaction('weather-data', 'readwrite');
                                var weather_data_location = tx_weather_data.objectStore("weather-data");

                                weather_data_location.put(json, json.id);

                                var tx_last_used = IndexDB.transaction('last-used', 'readwrite');
                                var last_used_location = tx_last_used.objectStore("last-used");

                                var ts = {
                                    ts: +new Date()
                                };
                                last_used_location.put(ts, "current");

                                callback();
                            } else if (json.cod == 429) {
                                M.toast({html: 'API Limit exceeded.'});
                            } else {
                                M.toast({html: json.message});
                            }
                        });
                    } catch (e) {
                        M.toast({html: 'Error while parsing JSON: ' + e});
                    }
                });
            });
        };
    } else {
        M.toast({html: 'No internet connection'});
    }
}
function getData(city, callback) {
    if (navigator.onLine) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=046556c9237983f3f147f37576993505&units=metric", {
            method: "GET"
        }).then(function (data) {
            try {
                data.json().then(function (json) {
                    console.log(json);
                    if (json.cod == 200) {
                        var tx_weather_data = IndexDB.transaction('weather-data', 'readwrite');
                        var weather_data_location = tx_weather_data.objectStore("weather-data");

                        weather_data_location.put(json, "current");

                        var tx_last_used = IndexDB.transaction('last-used', 'readwrite');
                        var last_used_location = tx_last_used.objectStore("last-used");

                        var ts = {
                            ts: +new Date()
                        };
                        last_used_location.put(ts, "current");

                        callback();
                    } else {
                        M.toast({html: 'An error was thrown, when trying to fetch data.'});
                    }
                });
            } catch (e) {
                M.toast({html: 'Error while parsing JSON: ' + e});
            }
        });
    } else {
        M.toast({html: 'No internet connection'});
    }
}
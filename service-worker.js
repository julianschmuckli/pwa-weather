var base_url = self.location.origin + "/pwa-weather";
const API_KEY = "046556c9237983f3f147f37576993505";
console.log(base_url);

var offline_files = [
    "index.html",
    "manifest.json",
    "assets/lib/materialize.min.js",
    "assets/lib/materialize.min.css",
    "assets/font/MaterialIcons-Regular.woff",
    "assets/font/MaterialIcons-Regular.woff2",
    "assets/font/MaterialIcons-Regular.tff",
    "assets/style.css",
    "assets/icon.png",
    "assets/icon_512.png",
    "assets/init.js",
    "assets/controller.js",
    "assets/lib.js",
    "assets/insert.js",
    "assets/fetch.js"
];

self.addEventListener('install', function (event) {
    console.log('Install!');

    //Load all files defined in the list above into cache when installing the app
    offline_files.forEach(function (file, index) {
        var offlineRequest = new Request(file);
        event.waitUntil(
            fetch(offlineRequest).then(function (response) {
                return caches.open('offline').then(function (cache) {
                    console.log('[oninstall] Cached offline page', response.url);
                    return cache.put(offlineRequest, response);
                });
            })
        );
    });
});
self.addEventListener("activate", event => {
    console.log('Activate!');
});
self.addEventListener('fetch', function (event) {
    console.log('Fetch!', event.request);

    var request = event.request;

    if (request.method === 'GET') {

        event.respondWith(
            fetch(request).catch(function (error) {

                console.log(
                    '[onfetch] Failed. Serving cached offline fallback ' +
                    error
                );
                return caches.open('offline').then(function (cache) {
                    var cache_file = (request.url).replace(base_url + "/", "").trim();
                    console.log("Loading " + cache_file);

                    if (cache_file == "") {
                        cache_file = offline_files[0];
                    }

                    return cache.match(cache_file);
                });
            })
        );
    }
});

self.addEventListener('sync', function (event) {
    console.log("Sync:");
    console.log(event);
    if (event.tag == 'getWeatherData') {
        event.waitUntil(getDataInBackground());
    } else if (event.tag == 'insertTempLocations') {
        event.waitUntil(convertTempToLocations());
    }
});

function convertTempToLocations() {
    console.log("Started converting");
    if ('indexedDB' in self) {
        var request = indexedDB.open('weather-data', 3);
        request.onsuccess = function () {
            var IndexDB = request.result;
            IndexDB.transaction(["temp-location-data"]).objectStore("temp-location-data").getAll().onsuccess = function (event) {
                event.target.result.forEach(function (curr) {
                    console.log(curr);

                    //Insert new location
                    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + curr + "&appid=" + API_KEY + "&units=metric", {
                        method: "GET"
                    }).then(function (data) {
                        try {
                            data.json().then(function (json) {
                                if (json.cod == 200) {
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
                                        } else {
                                            console.log('This is city is already in your list.');
                                        }
                                    };
                                } else if (json.cod == 429) {
                                    console.log('API Limit exceeded.');
                                } else {
                                    console.log('City was not found. Try another name.');
                                }
                            });
                        } catch (e) {
                            console.log('Error while parsing JSON: ' + e);
                        }
                    });

                    //Delete temp locations
                    IndexDB.transaction(["temp-location-data"], "readwrite").objectStore("temp-location-data").clear();
                });

                if (Notification.permission == 'granted') {
                    var options = {
                        body: 'The cities has been added to your list.',
                        icon: 'assets/icon.png',
                        vibrate: [100, 50, 100],
                        data: {
                            dateOfArrival: Date.now(),
                            primaryKey: 1
                        }
                    };
                    self.registration.showNotification('Cities added', options);
                }
            };
        }
    }
}

function getDataInBackground() {
    if (navigator.onLine) {
        M.toast({html: 'Fetching new data'});

        if ('indexedDB' in self) {
            var request = indexedDB.open('weather-data', 3);
            request.onsuccess = function () {
                var IndexDB = request.result;
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
                                    } else {
                                        console.log('An error was thrown, when trying to fetch data.');
                                    }
                                });
                            } catch (e) {
                                console.log('Error while parsing JSON: ' + e);
                            }
                        });
                    });
                };
            };
        }
    } else {
        console.log('No internet connection');
    }
}
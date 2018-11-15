var base_url = self.location.origin + "/pwa-weather";
console.log(base_url);

var offline_files = [
    "index.html",
    "manifest.json",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "assets/style.css",
    "assets/icon.png",
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
    if (event.tag == 'getWeatherData') {
        event.waitUntil(getDataInBackground());
    }
});

function getData() {
    if (navigator.onLine) {
        M.toast({html: 'Fetching new data'});

        IndexDB.transaction(["location-data"]).objectStore("location-data").getAll().onsuccess = function (event) {
            event.target.result.forEach(function (id) {
                fetch("https://api.openweathermap.org/data/2.5/weather?id=" + id + "&appid=046556c9237983f3f147f37576993505&units=metric", {
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
    } else {
        console.log('No internet connection');
    }
}
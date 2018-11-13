var base_url = self.location.origin + "/pwa-weather";
console.log(base_url);

var global_self = self;

var offline_files = [
    "index.html",
    "manifest.json",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
    "https://code.jquery.com/jquery-3.3.1.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "assets/style.css",
    "assets/icon.png",
    "assets/init.js",
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

//TODO Not use localStorage for Service Worker. Instead use IndexDB
/*self.addEventListener('sync', function (event) {
    if (event.tag == 'getWeatherData') {
        event.waitUntil(getData("Baden,Switzerland"));
    }
});

function getData(city) {
    if (navigator.onLine) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=046556c9237983f3f147f37576993505&units=metric", {
            method: "GET"
        }).then(function (data) {
            try {
                data.json().then(function (json) {
                    console.log(json);
                    if (json.cod == 200) {
                        global_self.localStorage.setItem("weather_data", JSON.stringify(json));
                        global_self.localStorage.setItem("last_sync_time", +new Date());
                        console.log("Loaded new data");
                    } else {
                        console.error('An error was thrown, when trying to fetch data.');
                    }
                });
            } catch (e) {
                console.error('Error while parsing JSON: ' + e);
            }
        });
    } else {
        console.warn('No internet connection');
    }
}*/
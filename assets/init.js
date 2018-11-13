var IndexDB_request = undefined, IndexDB = undefined;
window.onload = function () {
    //Database initialization
    if ('indexedDB' in window) {
        IndexDB_request = indexedDB.open('weather-data', 1);

        IndexDB_request.onupgradeneeded = function (event) {
            var upgradeDb = IndexDB_request.result;
            if (!upgradeDb.objectStoreNames.contains('weather-data')) {
                var dataDB = upgradeDb.createObjectStore('weather-data');
                //dataDB.createIndex("dt", "dt", {unique: true});
            }
            if (!upgradeDb.objectStoreNames.contains('last-used')) {
                var lastUsedDB = upgradeDb.createObjectStore('last-used');
                //lastUsedDB.createIndex("ts", "ts", {unique: true});
            }
        };

        IndexDB_request.onsuccess = function () {
            IndexDB = IndexDB_request.result;
            init();
        }
    }
};

function init() {
    if (navigator.onLine) {
        getData("Baden,Switzerland", showTemperature);
    } else {
        showTemperature();
        navigator.serviceWorker.ready.then(function (swRegistration) {
            return swRegistration.sync.register('getWeatherData');
        });
    }
}
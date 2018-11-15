var IndexDB_request = undefined, IndexDB = undefined;

const API_KEY = "046556c9237983f3f147f37576993505";
window.onload = function () {
    //Database initialization
    if ('indexedDB' in window) {
        IndexDB_request = indexedDB.open('weather-data', 2);

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
            if (!upgradeDb.objectStoreNames.contains('location-data')) {
                var locationDB = upgradeDb.createObjectStore('location-data');
            }
        };

        IndexDB_request.onsuccess = function () {
            IndexDB = IndexDB_request.result;
            init();
        }
    }
};

var card_add_dialog_html;

function init() {
    card_add_dialog_html = document.getElementById("add_dialog").outerHTML;
    if (navigator.onLine) {
        getData(showTemperature);
    } else {
        showTemperature();
        M.toast({html: 'You are offline. Loading old data.'});
        navigator.serviceWorker.ready.then(function (swRegistration) {
            return swRegistration.sync.register('getWeatherData');
        });
    }
}

window.addEventListener("online", changeNetworkListener);
window.addEventListener("offline", changeNetworkListener);

var current_notification_network_listener;

function changeNetworkListener() {
    try {
        current_notification_network_listener.dismiss();
    } catch (e) {
    }

    if (!navigator.onLine) {
        current_notification_network_listener = M.toast({html: 'You are offline now.'});
    } else {
        current_notification_network_listener = M.toast({html: 'Welcome back online.'});
        getData(showTemperature);
    }
}
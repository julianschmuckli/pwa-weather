window.onload = function () {
    if (navigator.onLine) {
        getData("Baden,Switzerland", showTemperature);
    } else {
        showTemperature();
        navigator.serviceWorker.ready.then(function (swRegistration) {
            return swRegistration.sync.register('getWeatherData');
        });
    }
};
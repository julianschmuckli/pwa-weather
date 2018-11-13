function getData(city, callback) {
    if (navigator.onLine) {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=046556c9237983f3f147f37576993505&units=metric", {
            method: "GET"
        }).then(function (data) {
            try {
                data.json().then(function (json) {
                    console.log(json);
                    if (json.cod == 200) {
                        localStorage.setItem("weather_data", JSON.stringify(json));
                        localStorage.setItem("last_sync_time", +new Date());
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
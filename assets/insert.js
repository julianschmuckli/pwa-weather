function showTemperature() {
    try {
        var transaction = IndexDB.transaction(["weather-data"]).objectStore("weather-data").get("current").onsuccess = function (event) {
            document.getElementById("temperature_1").innerText = Math.round(event.target.result.main.temp);
        }
    } catch (e) {
        getData("Baden,Switzerland", showTemperature);
    }
}
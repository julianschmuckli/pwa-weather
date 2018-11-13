function showTemperature() {
    try {
        IndexDB.transaction(["weather-data"]).objectStore("weather-data").get("current").onsuccess = function (event) {
            document.getElementById("temperature").innerText = Math.round(event.target.result.main.temp);
            document.getElementById("humidity").innerText = Math.round(event.target.result.main.humidity);
            document.getElementById("pressure").innerText = Math.round(event.target.result.main.pressure);
        };

        IndexDB.transaction(["last-used"]).objectStore("last-used").get("current").onsuccess = function (event) {
            var date = new Date(event.target.result.ts);
            document.getElementById("last_time_synced").innerText = (date.getDate() + "").padStart(2, "0") + "." + ((date.getMonth() + 1) + "").padStart(2, "0") + "." + date.getFullYear() + " " + (date.getHours() + "").padStart(2, "0") + ":" + (date.getMinutes() + "").padStart(2, "0") + ":" + (date.getSeconds() + "").padStart(2, "0");
        }
    } catch (e) {
        console.error(e);
        getData("Baden,Switzerland", showTemperature);
    }
}
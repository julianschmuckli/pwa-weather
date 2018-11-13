function showTemperature() {
    try {
        var json = JSON.parse(localStorage.getItem("weather_data"));
        document.getElementById("temperature_1").innerText = Math.round(json.main.temp);
    } catch (e) {
        getData("Baden,Switzerland", showTemperature);
    }
}
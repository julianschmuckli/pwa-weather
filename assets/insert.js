function showTemperature() {
    try {
        var card_container = document.getElementById("card_container");
        var card_add_dialog_html = document.getElementById("add_dialog").outerHTML;

        IndexDB.transaction(["weather-data"]).objectStore("weather-data").getAll().onsuccess = function (event) {
            card_container.innerHTML = "";
            event.target.result.forEach(function (curr, index) {
                var location_card = "<div class='col s12 m6'>" +
                    "    <div class='card white darken-1' id='city_" + curr.id + "' data-id='" + curr.id + "'>" +
                    "        <div class='card-content black-text'>" +
                    "            <span class='card-title'>" + curr.name + ", " + curr.sys.country + "</span>" +
                    "            <div class='row'>" +
                    "                <div class='col s6'>" +
                    "                    <span class='temperature'><span id='temperature'>" + Math.round(curr.main.temp) + "</span> &deg;C</span>" +
                    "                </div>" +
                    "                <div class='col s6'>" +
                    "                    <span class='other_details'><span id='humidity'>" + Math.round(curr.main.humidity) + "</span>%</span><br>" +
                    "                    <span class='other_details'><span id='pressure'>" + Math.round(curr.main.pressure) + "</span> hPa</span><br>" +
                    "                </div>" +
                    "            </div>" +
                    "        </div>" +
                    "        <div class='card-action'>" +
                    "            <a onclick='deleteCity(" + curr.id + ")'><i class='material-icons'>delete</i></a>" +
                    "        </div>" +
                    "    </div>" +
                    "</div>";

                card_container.appendChild(createElementFromHTML(location_card));
            });

            card_container.appendChild(createElementFromHTML(card_add_dialog_html));
        };

        IndexDB.transaction(["last-used"]).objectStore("last-used").get("current").onsuccess = function (event) {
            var date = new Date(event.target.result.ts);
            document.getElementById("last_time_synced").innerText = (date.getDate() + "").padStart(2, "0") + "." + ((date.getMonth() + 1) + "").padStart(2, "0") + "." + date.getFullYear() + " " + (date.getHours() + "").padStart(2, "0") + ":" + (date.getMinutes() + "").padStart(2, "0") + ":" + (date.getSeconds() + "").padStart(2, "0");
        }
    } catch (e) {
        console.error(e);
        getData(showTemperature);
    }
}
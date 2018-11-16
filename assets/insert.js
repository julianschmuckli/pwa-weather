var card_container

function showTemperature() {
    try {
        card_container = document.getElementById("card_container");

        //Check first if entries are available.
        IndexDB.transaction(["weather-data"]).objectStore("weather-data").count().onsuccess = function (event) {

            var count = event.target.result;
            if (count > 0) {
                //If entries are available load the data in the container
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
                            "            <a onclick='deleteCity(" + curr.id + ")' style='cursor:pointer;color:#A81616;'><i class='material-icons'>delete</i></a>" +
                            "        </div>" +
                            "    </div>" +
                            "</div>";

                        card_container.appendChild(createElementFromHTML(location_card));
                    });

                    card_container.appendChild(createElementFromHTML(card_add_dialog_html));
                };
            } else {
                clearContainer();
            }
        };
    } catch (e) {
        M.toast({html: "There was an error: " + e})
    }

    showLastSync();
}

function showOfflineLocations() {
    IndexDB.transaction(["temp-location-data"]).objectStore("temp-location-data").count().onsuccess = function (event) {
        document.getElementById("offline_locations").innerText = event.target.result;
        document.getElementById("offline_locations_wrapper").style.display = "inline-block";
    }
}

function showLastSync() {
    IndexDB.transaction(["last-used"]).objectStore("last-used").get("current").onsuccess = function (event) {
        try {
            var date = new Date(event.target.result.ts);
            document.getElementById("last_time_synced").innerText = (date.getDate() + "").padStart(2, "0") + "." + ((date.getMonth() + 1) + "").padStart(2, "0") + "." + date.getFullYear() + " " + (date.getHours() + "").padStart(2, "0") + ":" + (date.getMinutes() + "").padStart(2, "0") + ":" + (date.getSeconds() + "").padStart(2, "0");
        } catch (e) {
            //Never synced
        }
    }
}

function clearContainer() {
    card_container.innerHTML = "";
    card_container.appendChild(createElementFromHTML(card_add_dialog_html));
}
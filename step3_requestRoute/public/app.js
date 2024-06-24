/*
 Copyright 2024 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

(function(){
    let map;
    let placeIds = [];

    async function initMap() {
        const { Map } = await google.maps.importLibrary('maps');
        
        map = new Map(document.getElementById('map'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
            mapId: 'DEMO_MAP_ID'
        });
    }

    async function initPlace() {
        const { Autocomplete } = await google.maps.importLibrary('places');
        let autocomplete = [];
        let locationFields = Array.from(document.getElementsByClassName('input-location'));

        //Enable autocomplete for input fields
        locationFields.forEach((elem,i) => {
            autocomplete[i] = new Autocomplete(elem);
            google.maps.event.addListener(autocomplete[i],"place_changed", () => {
                let place = autocomplete[i].getPlace(); 
                if(Object.keys(place).length > 0){
                    if (place.place_id){
                        placeIds[i] = place.place_id; //We use Place Id in this example                
                    } else {
                        placeIds.splice(i,1); //If no place is selected or no place is found, remove the previous value from the placeIds.
                        window.alert(`No details available for input: ${place.name}`);
                        return;
                    }
                }
            }); 
        });        
    }

    function requestRoute(){
        let btn = document.getElementById('btn-getroute');

        btn.addEventListener('click', () => {
            //In this example, we will extract the Place IDs from the Autocomplete response
            //and use the Place ID for origin and destination
            if(placeIds.length == 2){
                let reqBody = {
                    "origin": {
                        "placeId": placeIds[0]
                    },
                    "destination": {
                        "placeId": placeIds[1]
                    }
                }
    
                fetch("/request-route", {
                    method: 'POST',
                    body: JSON.stringify(reqBody),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((response) => {
                    return response.json();
                }).then((data) => {
                    console.log(data);
                    renderRoutes(data);
                }).catch((error) => {
                    console.log(error);
                });
            } else {
                window.alert('Location must be set');
                return;
            }
        });
    }

    initMap();
    initPlace();
    requestRoute();
}());
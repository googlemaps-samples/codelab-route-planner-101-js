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
    let paths = [];
    let markers = [];

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

    async function renderRoutes(data) {
        clearUIElem(paths,'polyline');
        const { encoding } = await google.maps.importLibrary("geometry");
        let routes = data.routes;
        let decodedPaths = [];

        ///Display routes and markers
        routes.forEach((route,i) => {
            if(route.hasOwnProperty('polyline')){
                //Decode the encoded polyline
                decodedPaths.push(encoding.decodePath(route.polyline.encodedPolyline));

                //Draw polyline on the map
                for(let i = decodedPaths.length - 1; i >= 0; i--){
                    let polyline = new google.maps.Polyline({
                        map: map,
                        path: decodedPaths[i],
                        strokeColor: "#4285f4",
                        strokeOpacity: 1,
                        strokeWeight: 5
                    });
                    paths.push(polyline);
                }
                
                //Add markers for origin and destination
                addMarker(route.legs[0].startLocation.latLng,"A");
                addMarker(route.legs[0].endLocation.latLng,"B");

                setViewport(route.viewport);
            } else {
                console.log("Route cannot be found");
            }
        });
    }

    async function addMarker(pos,label){
        clearUIElem(markers,'advMarker');
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { PinElement } = await google.maps.importLibrary("marker");
        const { LatLng } = await google.maps.importLibrary("core");
        let pinGlyph = new PinElement({
            glyphColor: "#fff",
            glyph: label
        });
        let marker = new AdvancedMarkerElement({
            position: new LatLng({lat:pos.latitude,lng:pos.longitude}),
            gmpDraggable: false,
            content: pinGlyph.element,
            map: map
        });
        markers.push(marker);
    }

    async function setViewport(viewPort) {
        const { LatLng } = await google.maps.importLibrary("core");
        const { LatLngBounds } = await google.maps.importLibrary("core");        
        let sw = new LatLng({lat:viewPort.low.latitude,lng:viewPort.low.longitude});
        let ne = new LatLng({lat:viewPort.high.latitude,lng:viewPort.high.longitude});        
        map.fitBounds(new LatLngBounds(sw,ne));
    }

    function clearUIElem(obj,type) {
        if(obj.length > 0){
            if(type == 'advMarker'){
                obj.forEach(function(item){
                    item.map = null;
                });
            } else {
                obj.forEach(function(item){
                    item.setMap(null);
                });
            }
        }
    }

    initMap();
    initPlace();
    requestRoute();
}());
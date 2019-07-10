"use strict";

class MyMap { 
    constructor(map) {
        this.map = map;
        this.markers = []; // to replace var markers = [] in a class
    }
    
    addMarker(props) { // a method, it's a function in an objet
        // two ways to pass the this value to the nested function, solution 1 : add var self = this at the top of the function to keep a reference to this. Solution 2, use ES6 way of writing function : () =>, functions written in this way will check and keep the same value of this for the nested function.

        // check content
        if(props.restaurantName){
            const infoWindow = new google.maps.InfoWindow({
                content:props.restaurantName //pass the restaurant name to show when marker is clicked
            });
            const marker = new google.maps.Marker({
                position: {lat:props.lat, lng:props.long},
                map:this.map,
                infowindow: infoWindow,
            });
            marker.addListener("click", () => {
                this.markers.forEach((marker) => {
                    marker.infowindow.close(this.map, marker); //onclick on marker close infoWindow of other markers
                }); 
                infoWindow.open(this.map, marker); // open new marker
                // link the event handle to click on the div of box-restaurant to show restaurant details when click on the marker
                app.selectedRestaurant = props;
                // restaurantManager.showRestaurantDetailsWhenClicked(props); // link the marker to the list, restaurant details will be shown when clicked on the marker
            });
            this.markers.push(marker);
        }
    }

    clearMarkers() {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers.length = 0;
    }

    // get user position and show unique marker, use the location to search for nearby restaurants
    focusOnUserPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                const marker = new google.maps.Marker({
                    position: {lat:pos.lat, lng:pos.lng},
                    map: this.map,
                    animation: google.maps.Animation.DROP,
                    title: 'Vous êtes là !',
                    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' // blut icon for the user position only       
                });
    
                this.map.setCenter(pos);
    
                // google place nearby search restaurants, leave the code here to be able to use the user location
                this.updateNearbyRestaurants(pos); // show restaurants around user's location
            }, () => {
                this.handleLocationError(true, infoWindow, this.map.getCenter());
            });
        } else {
            // Browser doesn't support Geolocation
            this.handleLocationError(false, infoWindow, this.map.getCenter());
        }
    }

    // use user location to search nearby restaurants, function reusable for search this area function
    updateNearbyRestaurants(centerLocation) {
        const center = centerLocation || this.map.getCenter(); // here is a const not let because everytime when this function is called, a new center is created, no modification will be made on the previous center. || means when there is no centerLocation passed as a parameter, this.map.getCenter() will be assigned as the value of this const
        const request = {
            location: center, // by passing the location as parameter, this function is reused when searchAreaButton button is clicked
            radius: '500',
            type: ['restaurant']
        };
        // app.restaurants = []; // clear the result list everytime the center changes to only show restaurant of the newest search
        const service = new google.maps.places.PlacesService(this.map);
        service.nearbySearch(request, this.nearbySearchCallback.bind(this)); // nearby search to get a list of restaurants with place id, using bind(this) to keep the this in the nearbySearchCallback, otherwise "this" is undefined in the parameter
    }

    // first get the address and latlng of the restaurant, since there is no review included in the nearby search, use another function getDetails to get the review details
    nearbySearchCallback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                const request = {
                    placeId: results[i].place_id,
                    fields: ["formatted_address","reviews"]
                };
    
                const goolePlaceName = results[i].name;
                const googlePlaceAddress = results[i].vicinity;
    
                const integrateGoogleRestaurants = {
                    "restaurantName": goolePlaceName,
                    "address": googlePlaceAddress,
                    "lat": results[i].geometry.location.lat(),
                    "long": results[i].geometry.location.lng(),
                    "ratings": [],
                };
    
                const service = new google.maps.places.PlacesService(this.map);
                service.getDetails(request, this.detailSearchCallBack(integrateGoogleRestaurants));
            }
        }
    }

    // get the review details of the restaurant
    detailSearchCallBack (integrateGoogleRestaurants) {  // the callback funtion that's gonna return a function, use this technic to use the var integrateGoogleRestaurants, and send the ratings to the var 
        return function callbackPlaceDetails(result, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                // createMarker(place);
                const reviews = result.reviews || []; // sometime a restaurant doesn't have comment, use || [] technic to add an empty array in this case to avoid forEach crashes
                reviews.forEach(function(review) {
                    const resultDetailRating = review.rating;
                    const resultDetailComment = review.text;
        
                    integrateGoogleRestaurants.ratings.push({
                        "stars": resultDetailRating,
                        "comment":  resultDetailComment,
                    });
                });
                app.restaurants.unshift(integrateGoogleRestaurants); // push the list here instead of previous function, otherwise the push will be executed before the function createCallBack finishs, end up with list being pushed to listRestaurant without the ratings and comments
                // restaurantManager.sendListToHTML(listRestaurants); //update the list
            }
        }
    }

    // handle geolocation error
    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    streetView(restaurant) {
        const streetViewPic = "https://maps.googleapis.com/maps/api/streetview?size=312x240&location=" + restaurant.lat + "," + restaurant.long + "&heading=151.78&pitch=-0.76&key=AIzaSyAqxE4oHzIGt8Bg9Eb3yhjz6-arNbRbE5A";
        return streetViewPic;
    } 
}
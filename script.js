"use strict";

function calculateAverageRatings(restaurant) {
    let totalRating = 0;
    let averageRating = 0;

    restaurant.ratings.forEach(function(ratings) {
        totalRating += ratings.stars;
    });

    if (restaurant.ratings.length === 0) {
        averageRating = 0; // put the rating to 0 in case the restaurant currently has no rating to avoid showing NaN
    } else {
        averageRating = totalRating/restaurant.ratings.length; // get the average rating
    }

    const roundedAverageRating = Math.round(averageRating * 10) / 10; // round the average rating to 1 decimal
    return roundedAverageRating;
};

Vue.component("restaurant-list-item", {
    props: ["restaurant"], //parameter of this component
    template:   `<div class="boxRestaurant" v-on:click="$emit('restaurant-selected')">
                    <h6>{{  restaurant.restaurantName  }}</h6>
                    <div class="starsOuter">
                        <div class="starsInner" :style='{width: ratingPercentage + "%"}'></div>
                    </div>
                    <span class="numberRating">{{ averageRatings }}</span>
                    <p>{{ restaurant.address}}</p>
                </div>`,
    computed: {  // computed properties to be used only in this component
        averageRatings() {
            return calculateAverageRatings(this.restaurant); // pass the props as parameter
        },

        ratingPercentage() {
            let starPercentage = Math.round((this.averageRatings/5) * 100);
            return starPercentage;
        },

    }
});

Vue.component("selected-restaurant-details", {
    props: ["restaurantToShow"],
    template:   `<div class="restaurantDetails">
                    <h6>{{ restaurantToShow.restaurantName }}</h6>
                    <div class="streetView"><img :src="newMap.streetView(restaurantToShow)"></div>
                    <div class="starsOuter">
                        <div class="starsInner" :style='{width: ratingPercentage + "%"}'></div>
                    </div>
                    <span class="numberRating">{{ averageRatings }}</span>
                    <p>{{ restaurantToShow.address}}</p>
                    <div class="showComment">
                        <p v-for="rating in restaurantToShow.ratings"> Avis : {{ rating.comment }} </p> 
                    </div>
                </div>`,
    // use v-for in line52 to loop through the restaurant ratings directly, then only show the comment part of the rating

    computed: {  // computed properties to be used only in this component
        averageRatings() {
            return calculateAverageRatings(this.restaurantToShow); // pass the props as parameter
        },

        ratingPercentage() {
            let starPercentage = Math.round((this.averageRatings/5) * 100);
            return starPercentage;
        },
    }

});

Vue.component("form-add-new-comment", {
    props: ["restaurantToAddNewComment","ifShowForm"],
    
    data: function() {
        return {
            newRating: 5,
            newComment: '',
        }
    },

    //comments for template below: use v-on:submit and v-on:click to emit the action to the html form-add-new-comment tag, when either one of them is click, showForm can be changed to false from the html 
    template:  `<div class="addNewRating"">
                    <form action="#" id="form-addNewComment" @submit.prevent="onSubmit" v-on:submit="$emit('closed-clicked')">
                        <h5 class="form-title" id="title-addComment">Ajouter un avis</h5>
                        <div class="form-body">
                            <label for="your-rating">Donnez votre avis afin d'aider les autres utilisateurs</label>
                            <select name="your-rating" v-model.number="newRating" required>
                                <option disabled selected value>Note</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                            <br>
                            <textarea name="your-review" v-model="newComment" placeholder="Partager les détails de votre expérience à cet endroit" required></textarea>
                        </div>
                        <div class="form-footer">
                            <div class="row" id="buttons">
                                <button type="button" class="btn btn-light" id="cancelAddingComment"  v-on:click="$emit('closed-clicked')">Fermer</button>
                                <button  type="submit" class="btn btn-primary" value="Ajouter" id="submitNewComment">Ajouter</button>
                            </div>
                        </div>
                    </form>
                </div>`,
    methods: {
        onSubmit() {
            this.restaurantToAddNewComment.ratings.push({
                "stars":this.newRating,
                "comment":this.newComment,
            })

        }

    },

});


const app = new Vue ({  // things created in new Vue can only be used in new Vue, not in the components, and vice versa
    el:"#app",
    data: {
        restaurants:listRestaurants, // all the global vars and things needed to be accessed from all the app goes in the new Vue
        minStars: 0,
        maxStars: 5,
        selectedRestaurant: null,
        showForm: false,
    },
    methods: {  // methods created in the app can be used in the whole html but not in the components
        
    },
    watch: {
        restaurants: function(newValue, oldValue) { 
            newMap.clearMarkers();
            this.filteredListRestaurant.forEach((restaurant) => {
                newMap.addMarker(restaurant);
            });
        },

        minStars: function(newValue, oldValue) {
            newMap.clearMarkers();
            this.filteredListRestaurant.forEach((restaurant) => {
                newMap.addMarker(restaurant);
            });
        },
        maxStars: function(newValue, oldValue) {
            newMap.clearMarkers();
            this.filteredListRestaurant.forEach((restaurant) => {
                newMap.addMarker(restaurant);
            });
        }
    },
    computed: { // no parameters allowed in computed, if a function needs parameters, it will be in methods
        filteredListRestaurant() {
            const listResultAccordingOption = this.restaurants.filter((restaurant) => {
                const averageRating = calculateAverageRatings(restaurant);
                if ((averageRating >= this.minStars) && (averageRating <= this.maxStars)){ // if the restaurant rating is above or equels to the chosen option
                    return true;
                }
            })
            return listResultAccordingOption;
        }    
    }
});

let newMap; // declare newMap here to make it a global variable but only assign value when initMap is ready, line 109
function initMap() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 48.8566969, lng: 2.3514616},
        zoom: 14
    });

    newMap = new MyMap(map); 
    newMap.focusOnUserPosition();

    //to add a new place, right click anywhere and show an infoWindow,
    const infowindow =  new google.maps.InfoWindow({
		content: '<button type="button" class="btn btn-link" data-toggle="modal" data-target="#addNewPlace" id="ifAddNewPlace">Ajouter un endroit ici</button>'
	});
	google.maps.event.addListener(map, 'rightclick', function(event) {
		infowindow.setPosition(event.latLng);
        infowindow.open(map);

        // first geocoder, get the place where right clicked, get the address from the latlng and pre-fill the form
        const geocoder = new google.maps.Geocoder(); 
        const latLng = {lat: event.latLng.lat(), lng: event.latLng.lng()}; // get the latLng where right-clicked

        geocoder.geocode({'location': latLng}, function(results, status) {  // use the latlng from the click to get address
            if (status === 'OK') {
                const addressComponentsNumber = results[0].address_components[0].long_name; // get address results from the api
                const addressComponentsStreetName = results[0].address_components[1].long_name;
                const addressComponentsCityName = results[0].address_components[2].long_name;
                const addressComponentsZip = results[0].address_components[6].long_name;

                $("#inputAddress").val(addressComponentsNumber + ", " + addressComponentsStreetName);  // fill in the form
                $("#inputCity").val(addressComponentsCityName);
                $("#inputZipCode").val(addressComponentsZip);

                $("#ifAddNewPlace").click(function() { // when user click on the button to add a new place, show the modal form with address info pre-filled
                    $("#addNewPlace").show();
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }); 

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }
"use strict";

Vue.config.devtools = true;

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
                    <h6 class="restoName">{{  restaurant.restaurantName  }}</h6>
                    <div class="starsOuter">
                        <div class="starsInner" :style='{width: ratingPercentage + "%"}'></div>
                    </div>
                    <span class="numberRating">{{ averageRatings }}</span>
                    <p>{{ restaurant.address}}</p>
                </div>`,
    computed: {  // computed properties to be used only in this component, no parameters allowed
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
    props: ["restaurantToShow"], // will be coming from the app selectedRestaurant, so everytime the selected restaurant changes, the value will be passed to this component
    // comments for the template below: put streetview link in a function in classMyMap for a better readability 
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
    // use v-for in line52 to loop through the restaurant ratings directly without using a function like P7 without vue, then only show the comment part of the rating

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
    props: ["restaurantToAddNewComment","ifShowForm"], // passing the selectedRestaurant and boolean showForm from app as parameters
    
    data: function() {
        return {
            newRating: 5, // set directly a default value to the newRating
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

Vue.component("form-add-new-place", {
    props: ["arrayOfRestaurants"],
    data: function() {
        return {
            newPlaceName: '', // to get the valu from the v-model, have to pass the v model value here as data
            newPlaceStreet: '',
            newPlaceCity: '',
            newPlaceZip: null,
            newPlaceRating: 5,
            newPlaceComment: '',
        }
    },
    template: `<div class="addNewPlace">
                    <form action="#" id="form-addNewPlace" @submit.prevent="onSubmitNewPlace" v-on:submit="$emit('close-adding-place-clicked')">
                        <h5 class="form-title" id="addNewPlaceTitle">Ajouter un nouveau endroit</h5>
                        <div class="form-body">
                            <label for="validationCustom01">Nom de cet endroit</label>
                            <input type="text" class="form-control" id="inputNewName" placeholder="Nom de cet endroit" v-model="newPlaceName" required>

                            <div class="form-row" id="groupInputAdress">
                                <label for="validationCustom03">Adresse</label>
                                <input type="text" class="form-control" id="inputAddress" placeholder="L'adresse de cet endroit" v-model="newPlaceStreet" required><br>

                                <label for="validationCustom04">Ville</label>
                                <input type="text" class="form-control" id="inputCity" placeholder="Ville" v-model="newPlaceCity" required> <br>

                                <label for="validationCustom05">Code postale</label>
                                <input type="text" class="form-control" id="inputZipCode" placeholder="CP" v-model.number="newPlaceZip" required> <br>
                            </div> 

                            <div class="form-row" id="ratingOptions">
                                <label for="labelRatingOptions" id="labelRatingOptions">Donnez votre avis </label>
                                <select name="new-place-rating" v-model.number="newPlaceRating" required>
                                    <option disabled selected value>Note</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>           
                            </div> 
                            <br>
                            <textarea name="reviewForNewPlace" id="reviewForNewPlace" placeholder="Partager les détails de votre expérience à cet endroit" v-model="newPlaceComment" required></textarea> 
                        </div>
                        <div class="form-footer" id="addNewPlaceFormFooter">
                            <div class="row" id="newPlaceButtons">
                                <button type="button" class="btn btn-light" id="cancelAddingNewPlace"  v-on:click="$emit('close-adding-place-clicked')">Fermer</button>
                                <button type="submit" class="btn btn-primary" value="Ajouter" id="submitNewPlace">Ajouter</button>
                            </div>
                        </div>  
                    </form>
                </div>`,
    methods: {
        onSubmitNewPlace() {
            console.log("on submit new place"),
            this.$emit('pass-new-place-info', {
                "restaurantName":this.newPlaceName,
                "address":this.newPlaceStreet + ", " + this.newPlaceCity + " " + this.newPlaceZip,
                "lat":0,
                "long":0,
                "ratings":[
                    {
                        "stars":this.newPlaceRating,
                        "comment":this.newPlaceComment
                    }
                ],
            });
        }
    },
}) 


const app = new Vue ({  // things created in new Vue can only be used in new Vue, not in the components, and vice versa. Always create vue app after the components
    el:"#app",
    data: {
        restaurants:listRestaurants, // all the global vars and things needed to be accessed from all the app goes in the new Vue
        minStars: 0,
        maxStars: 5,
        selectedRestaurant: null,
        showForm: false,
        showFormNewPlace: false,
    },
    methods: {  // methods created in the app can be used in the whole html but not in the components
        geoCoderGetLatlng(newPlaceInfo) {
            console.log("geocoder function started");

            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({'address': newPlaceInfo.address}, (results, status) => {
            if (status === 'OK') {
                var newPlaceLatLng = results[0].geometry.location; // get the result from the api
                var newPlaceComplet = { // pushing the info needed to creat a new restaurant in the listRestaurant
                    "restaurantName": newPlaceInfo.restaurantName,
                    "address": newPlaceInfo.address,
                    "lat": newPlaceLatLng.lat(),
                    "long": newPlaceLatLng.lng(),
                    "ratings": [{
                        "stars": newPlaceInfo.ratings.stars,
                        "comment": newPlaceInfo.ratings.comment,
                    }]
                };
                console.log(newPlaceComplet);
                this.restaurants.push(newPlaceComplet); // instead of push, add new place to the beginning of the array
                // newMap.addMarker(newPlaceComplet,markers);//reuse the newMap class allows to have the same function as the other markers
                // infowindow.close(); // close the info window with the add new place button

                // $("#inputNewName").val("");// empty the input values if user finishes adding new place
                // $(".form-row").val("");
                // $("#reviewForNewPlace").val(""); 
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
        return false; 


        }
    },
    watch: {
        restaurants: function(newValue, oldValue) { // watchs data in the app, if their value changes, this function will be triggered
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
		content: '<button type="button" class="btn btn-link" id="ifAddNewPlace">Ajouter un endroit ici</button>'
    });

	google.maps.event.addListener(map, 'rightclick', function(event) {
		infowindow.setPosition(event.latLng);
        infowindow.open(map);

        
        // first geocoder, get the place where right clicked, get the address from the latlng and pre-fill the form
        // const geocoder = new google.maps.Geocoder(); 
        // const latLng = {lat: event.latLng.lat(), lng: event.latLng.lng()}; // get the latLng where right-clicked
        document.getElementById("ifAddNewPlace").addEventListener("click", updateFormStatus);
        // app.showFormNewPlace = true;
        function updateFormStatus(){
            app.showFormNewPlace = true;
        };
    }); 

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}


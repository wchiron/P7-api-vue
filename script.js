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
                    <div class="starsOuter">
                        <div class="starsInner" :style='{width: ratingPercentage + "%"}'></div>
                    </div>
                    <span class="numberRating">{{ averageRatings }}</span>
                    <p>{{ restaurantToShow.address}}</p>
                    <div class="showComment">
                        <p v-for="rating in restaurantToShow.ratings"> Avis : {{ rating.comment }} </p> 
                    </div>
                </div>
    `,
    // use v-for in line52 to loop through the restaurant ratings directly, then only show the comment part of the rating
    
    computed: {  // computed properties to be used only in this component
        averageRatings() {
            return calculateAverageRatings(this.restaurantToShow); // pass the props as parameter
        },

        ratingPercentage() {
            let starPercentage = Math.round((this.averageRatings/5) * 100);
            return starPercentage;
        },

        commentToShow() {
            let commentToShow = "";
            this.restaurantToShow.ratings.forEach(function(ratings) {
                commentToShow += "<p>Avis : " + ratings.comment + "</br></p>"; 
            })
            return commentToShow;
        }
    }

})


const app = new Vue ({  // things created in new Vue can only be used in new Vue, not in the components, and vice versa
    el:"#app",
    data: {
        restaurants:listRestaurants, // all the global vars and things needed to be accessed from all the app goes in the new Vue
        minStars: 0,
        maxStars: 5,
        selectedRestaurant: null,
    },
    methods: {  // methods created in the app can be used in the whole html but not in the components
        
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
})

function initMap() {
    console.log("Mouah")
}
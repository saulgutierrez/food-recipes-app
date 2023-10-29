const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal(); // Show random recipe every time the page refresh
fetchFavMeals(); // Fetch the marked recipes on the top of the page

async function getRandomMeal() {
    // Using await because the response isn't commonly avaliable immediately
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php"); // Fetch a random recipe
    const respData = await resp.json(); // Parse the data fetched
    const randomMeal = respData.meals[0]; // meals is the name of the main data json array
    addMeal(randomMeal, true);
}

// Search for a meal in the database
async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

// Search for a meal by name
async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
}

function addMeal(mealData, random = false) {
    console.log(mealData);

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${random
            ? `
            <span class="random"> Random Recipe </span>`
            : ""
        }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    // Fill/unfill fav icon and add meal to the favorite list when click on the fav icon
    const btn = meal.querySelector(".meal-body .fav-btn");

    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        }
        else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

// Save favorite meals to the LocalStorage
function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// Remove a meal from the LocalStorage
function removeMealLS(mealId) {
    const mealIds = getMealsLS(); // Get meals IDs from the LocalStorage
    // Set in the LocalStorage only the items that are diffent of the parameter id
    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter((id) => id !== mealId)));
}

// Get favorite meals from the LocalStorage
function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}


async function fetchFavMeals() {
    // Clean the container
    favoriteContainer.innerHTML = "";
    const mealIds = getMealsLS();
    // Get each item inside the LocalStorage
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
    <img
       src="${mealData.strMealThumb}"
       alt="${mealData.strMeal}"
    />
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    });
    // Append the card in the container
    favoriteContainer.appendChild(favMeal);

}

// The parameter comes from the API
function showMealInfo(mealData) {

    // Clean it up
    mealInfoEl.innerHTML = "";
    // Update the Meal Info
    const mealEl = document.createElement('div');
    const ingredients = [];
    // 20 is the max ingredients size in the API
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient" + i]) {
            // Save each ingredient in the empty array
            ingredients.push(
                // Fetch the ingredient and the measure
                `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
            );
        } else { // If ingredient doesn't exists
            break;
        }
    }
    // Putting all meal info
    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    />

    <p>
      ${mealData.strInstructions}
    </p>

    <h3>Ingredients:</h3>
    <ul>
      ${ingredients.map((ing) => `
          <li>${ing}</li>
          `
    ).join("")}
    </ul>
    `;

    mealInfoEl.appendChild(mealEl);
    // Make the popup container visible (Contains all instructions and ingredients)
    mealPopup.classList.remove("hidden");

}

searchBtn.addEventListener("click", async () => {
    // Clean container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    // Show all simmilarly keywords into the API
    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        })
    }
});

popupCloseBtn.addEventListener("click", () => {
    // Append the hidden class
    mealPopup.classList.add("hidden");
});


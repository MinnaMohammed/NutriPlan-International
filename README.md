
## 🎯 Project Overview

NutriPlan is a Food, Nutrition & Fitness Planner web application.

## 📁 Project Structure

```
starter/
├── index.html          # Main HTML file (ready)
├── README.md           # This file
└── src/
    ├── css/
    │   └── style.css   # Styles (ready)
    └── js/
        ├── main.js           # Entry point 
        ├── api/
        │   └── mealdb.js     # API module 
        ├── state/
        │   └── appState.js   # State management 
        └── ui/
            └── components.js  # UI components 
```


## 🔗 API Reference

### TheMealDB API (Free, No API Key Required)

Base URL: `https://www.themealdb.com/api/json/v1/1/`

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/categories.php` | Get all categories | [Try it](https://www.themealdb.com/api/json/v1/1/categories.php) |
| `/search.php?s={query}` | Search meals by name | [Try it](https://www.themealdb.com/api/json/v1/1/search.php?s=chicken) |
| `/lookup.php?i={id}` | Get meal by ID | [Try it](https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772) |
| `/filter.php?c={category}` | Filter by category | [Try it](https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood) |
| `/filter.php?a={area}` | Filter by area/cuisine | [Try it](https://www.themealdb.com/api/json/v1/1/filter.php?a=Italian) |
| `/random.php` | Get random meal | [Try it](https://www.themealdb.com/api/json/v1/1/random.php) |



To switch between pages, hide/show the relevant sections:
- **Meals Page**: Show `#search-filters-section`, `#meal-categories-section`, `#all-recipes-section`
- **Product Scanner**: Show `#products-section`
- **Food Log**: Show `#foodlog-section`

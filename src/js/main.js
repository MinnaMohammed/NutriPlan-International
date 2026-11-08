// API Service CONFIG
const BASE_URL = 'https://nutriplan-api.vercel.app/api';
const DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65
};
const STORAGE_KEY = 'nutriplan_food_log';

const categoryIcons = {
  Beef: 'fa-drumstick-bite',
  Chicken: 'fa-bowl-food',
  Dessert: 'fa-cake-candles',
  Lamb: 'fa-bacon',
  Miscellaneous: 'fa-kitchen-set',
  Pasta: 'fa-wheat-awn',
  Pork: 'fa-bacon',
  Seafood: 'fa-fish',
  Side: 'fa-carrot',
  Starter: 'fa-bell-concierge',
  Vegan: 'fa-seedling',
  Vegetarian: 'fa-leaf',
  Breakfast: 'fa-egg',
  Goat: 'fa-bone'
};

// Main cuisines
const topAreas = [
  'All Recipes',
  'Egyptian',
  'Italian',
  'American',
  'Mexican',
  'Japanese',
  'Indian',
  'French',
  'Chinese',
  'Canadian'
];

// Initializing the main variable required for the logic later on
let currentPage = 'meals';
let currentMeal = null;
let currentMealNutrition = null;
let mealsList = [];
let categoriesList = [];
let areasList = [];
let activeCategory = '';
let activeArea = '';
let isGridView = true;
let productsList = [];
let selectedNutriGrade = '';
let searchDebounceTimer = null;

// Accessing Home page specs elements 
const appLoadingOverlay = document.getElementById('app-loading-overlay');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const sidebar = document.getElementById('sidebar');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const headerMenuBtn = document.getElementById('header-menu-btn');
const pageHead = document.getElementById('page-head');
const pageDesc = document.getElementById('page-desc');

const searchFiltersSection = document.getElementById('search-filters-section');
const searchInput = document.getElementById('search-input');
const dynamicAreas = document.getElementById('dynamic-areas');
const mealCategoriesSection = document.getElementById('meal-categories-section');
const categoriesGrid = document.getElementById('categories-grid');

// All recipe details
const allRecipesSection = document.getElementById('all-recipes-section');
const recipesTitle = document.getElementById('recipes-title') || document.querySelector('#all-recipes-section h2');
const recipesCount = document.getElementById('recipes-count');
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const recipesGrid = document.getElementById('recipes-grid');
const mealDetails = document.getElementById('meal-details');
const backToMealsBtn = document.getElementById('back-to-meals-btn');
const heroImg = document.getElementById('hero-img');
const heroTag = document.getElementById('hero-tag');
const receipeTitle = document.getElementById('receipe-title');
const receipeTime = document.getElementById('receipe-time');
const heroServings = document.getElementById('hero-servings');
const heroCalories = document.getElementById('hero-calories');
const logMealBtn = document.getElementById('log-meal-btn');
const detailIngredientsCount = document.getElementById('detail-ingredients-count') || document.querySelector('#meal-details h2 span.ml-auto');
const detailIngredientsGrid = document.getElementById('detail-ingredients-grid') || document.querySelector('#meal-details .grid.grid-cols-1.md\\:grid-cols-2') || document.querySelector('#meal-details .grid.gap-3');
const detailInstructionsList = document.getElementById('detail-instructions-list') || document.querySelector('#meal-details .space-y-4');
const videoCard = document.getElementById('video-card');
const videoIframe = document.getElementById('video-iframe');


// Accessing all nutrition items
const nutritionCalServing = document.getElementById('nutrition-cal-serving');
const nutritionCalTotal = document.getElementById('nutrition-cal-total');
const caloriesText = document.getElementById('calories');
const caloriesTotal = document.getElementById('calories-total');
const proteinVal = document.getElementById('protein-val');
const proteinBarVal = document.getElementById('protein-bar-val');
const carbsVal = document.getElementById('carbs-val');
const carbsBar = document.getElementById('carbs-bar');
const fatVal = document.getElementById('fat-val');
const fatBarVal = document.getElementById('fat-bar-val');
const fiberVal = document.getElementById('fiber-val');
const fiberBarVal = document.getElementById('fiber-bar-val');
const sugarVal = document.getElementById('sugar-val');
const sugarBar = document.getElementById('sugar-bar');

// Accessing all product elements
const productsSection = document.getElementById('products-section');
const productSearchInput = document.getElementById('product-search-input');
const searchProductBtn = document.getElementById('search-product-btn');
const barcodeInput = document.getElementById('barcode-input');
const lookupBarcodeBtn = document.getElementById('lookup-barcode-btn');
const productCategories = document.getElementById('product-categories');
const productsCount = document.getElementById('products-count');
const productsGrid = document.getElementById('products-grid');

// Accessing food log nutrition details
const foodlogSection = document.getElementById('foodlog-section');
const foodlogDate = document.getElementById('foodlog-date');
const foodlogTodaySection = document.getElementById('foodlog-today-section');
const caloriesProgress = document.getElementById('calories-progress');
const caloriesProgressBar = document.getElementById('calories-progress-bar');
const proteinProgress = document.getElementById('protein-progress');
const proteinProgressBar = document.getElementById('protein-progress-bar');
const carbsProgress = document.getElementById('carbs-progress');
const carbsProgressBar = document.getElementById('carbs-progress-bar');
const fatProgress = document.getElementById('fat-progress');
const fatProgressBar = document.getElementById('fat-progress-bar');
const loggedItemsHeading = document.getElementById('logged-items-heading') || document.querySelector('#foodlog-today-section h4');
const clearFoodlog = document.getElementById('clear-foodlog');
const loggedItemsList = document.getElementById('logged-items-list');
const weeklyChart = document.getElementById('weekly-chart');

// Acessing food log quick btns at the bottom  
const quickLogMealBtn = document.getElementById('quick-log-meal-btn');
const quickScanProductBtn = document.getElementById('quick-scan-product-btn');
const quickCustomEntryBtn = document.getElementById('quick-custom-entry-btn');

async function searchMeals(query = '', limit = 25) {
  try {
    const res = await fetch(`${BASE_URL}/meals/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching meals:', err);
    return [];
  }
}

async function filterByCategory(category, limit = 25) {
  try {
    const res = await fetch(`${BASE_URL}/meals/filter?category=${encodeURIComponent(category)}&limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error filtering category:', err);
    return [];
  }
}


async function filterByArea(area, limit = 25) {
  try {
    const res = await fetch(`${BASE_URL}/meals/filter?area=${encodeURIComponent(area)}&limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error filtering area:', err);
    return [];
  }
}

async function getMealById(id) {
  try {
    const res = await fetch(`${BASE_URL}/meals/${id}`);
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error('Error getting meal :', err);
    return null;
  }
}

async function getCategories() {
  try {
    const res = await fetch(`${BASE_URL}/meals/categories`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error getting categories:', err);
    return [];
  }
}

async function getAreas() {
  try {
    const res = await fetch(`${BASE_URL}/meals/areas`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching areas:', err);
    return [];
  }
}


async function analyzeRecipe(recipeName, ingredientsList) {
  try {
    const res = await fetch(`${BASE_URL}/nutrition/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'tH6kDLHPJfCkHgLQDBT9gCmwwQPGJhQP7gTg9jgH'
      },
      body: JSON.stringify({
        recipeName: recipeName,
        ingredients: ingredientsList
      })
    });
    const data = await res.json();
    if (data && data.success && data.data) {
      return data.data;
    }
    return null;
  } catch (err) {
    console.error('Nutrition API error:', err);
    return null;
  }
}

async function searchProducts(query, limit = 24) {
  try {
    const res = await fetch(`${BASE_URL}/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error searching products:', err);
    return [];
  }
}

async function getProductByBarcode(barcode) {
  try {
    const res = await fetch(`${BASE_URL}/products/barcode/${encodeURIComponent(barcode)}`);
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error('Error looking up barcode:', err);
    return null;
  }
}


async function getProductsByCategory(category, limit = 24) {
  try {
    const res = await fetch(`${BASE_URL}/products/category/${encodeURIComponent(category)}?limit=${limit}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error fetching products :', err);
    return [];
  }  
}

function getAllLogs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function addLogEntry(entry) {
  const logs = getAllLogs();
  const newEntry = {
    id: Date.now() + '-' + Math.floor(Math.random() * 100000),
    name: entry.name || 'Untitled Food',
    source: entry.source || 'Recipe',
    image: entry.image || '',

    calories: Math.round(Number(entry.calories) || 0),
    protein: Math.round(Number(entry.protein) || 0),
    carbs: Math.round(Number(entry.carbs) || 0),
    fat: Math.round(Number(entry.fat) || 0),

    loggedAt: new Date().toISOString(),
    dateKey: new Date().toISOString().split('T')[0]
  };
  logs.unshift(newEntry);
  saveLogs(logs);
  return newEntry;
}

function removeLogEntry(id) {
  const logs = getAllLogs().filter(item => item.id !== id);
  saveLogs(logs);
  return logs;
}

function clearAllLogs() {
  saveLogs([]);
}

function getTodayTotals() {
  const todayKey = new Date().toISOString().split('T')[0];
  const todayLogs = getAllLogs().filter(item => item.dateKey === todayKey);

  return todayLogs.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      acc.count += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0, items: todayLogs }
  );
}

function getWeeklyData() {
  const days = [];
  const calories = [];
  const protein = [];
  const carbs = [];
  const fat = [];

  const allLogs = getAllLogs();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayLogs = allLogs.filter(item => item.dateKey === dateKey);
    const dayCal = dayLogs.reduce((sum, item) => sum + item.calories, 0);
    const dayProt = dayLogs.reduce((sum, item) => sum + item.protein, 0);
    const dayCarb = dayLogs.reduce((sum, item) => sum + item.carbs, 0);
    const dayFat = dayLogs.reduce((sum, item) => sum + item.fat, 0);

    days.push(i === 0 ? 'Today' : dayName);
    calories.push(dayCal);
    protein.push(dayProt);
    carbs.push(dayCarb);
    fat.push(dayFat);
  }

  return { days, calories, protein, carbs, fat };
}

function renderCategoriesUI(categories) {
  if (!categoriesGrid) return;
  if (!categories.length) {
    categoriesGrid.innerHTML = '<p class="text-xs text-gray-400 col-span-full">No categories</p>';
    return;
  }

  categoriesGrid.innerHTML = categories
    .slice(0, 12)
    .map(cat => {
      const icon = categoryIcons[cat.name] || 'fa-utensils';
      return `
      <div
        class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
        data-category="${cat.name}"
      >
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="overflow-hidden">
            <h3 class="text-xs sm:text-sm font-bold text-gray-900 truncate">${cat.name}</h3>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  categoriesGrid.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      onSelectCategory(card.dataset.category);
    });
  });
}

function renderAreaFiltersUI(areas) {
  if (!dynamicAreas) return;

  dynamicAreas.innerHTML = topAreas
    .map(area => {
      const isActive = activeArea === area || (area === 'All Recipes' && !activeArea);
      const activeClass = isActive
        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      return `
      <button
        class="area-filter-btn px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all cursor-pointer ${activeClass}"
        data-area="${area}"
      >
        ${area}
      </button>
    `;
    })
    .join('');

  dynamicAreas.querySelectorAll('.area-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const area = btn.dataset.area;
      onSelectArea(area === 'All Recipes' ? '' : area);
    });
  });
}

function renderMealsGridUI(meals) {
  if (!recipesGrid) return;
  if (recipesCount) {
    recipesCount.textContent = `Showing ${meals.length} recipes`;
  }

  if (!meals || meals.length === 0) {
    recipesGrid.className = 'col-span-full';
    recipesGrid.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">No recipes found</p>
        <p class="text-gray-400 text-sm mt-2">Try searching with a different term or cuisine</p>
      </div>
    `;
    return;
  }


  if (isGridView) {
    recipesGrid.className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5';
  } else {
    recipesGrid.className = 'grid grid-cols-1 gap-4';
  }

  recipesGrid.innerHTML = meals
    .map(meal => {
      const category = meal.category || 'Recipe';
      const area = meal.area || 'International';
      const img = meal.thumbnail || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400';



      if (!isGridView) {
        return `
        <div
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row group border border-gray-100"
          data-meal-id="${meal.id}"
        >
          <div class="w-full sm:w-48 h-40 overflow-hidden shrink-0 relative">
            <img
              src="${img}"
              alt="${meal.name}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">${category}</span>
                <span class="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">${area}</span>
              </div>
              <h3 class="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">${meal.name}</h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                ${meal.instructions && Array.isArray(meal.instructions) ? meal.instructions[0] : 'Click to view complete ingredients, instructions and nutritional breakdown.'}
              </p>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <span class="flex items-center gap-1 font-medium"><i class="fa-solid fa-clock text-emerald-600"></i> ~30 mins</span>
              <span class="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                View Recipe <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </span>
            </div>
          </div>
        </div>
      `;
      }


      return `
      <div
        class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between border border-gray-100"
        data-meal-id="${meal.id}"
      >
        <div>
          <div class="relative h-48 overflow-hidden bg-gray-100">
            <img
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              src="${img}"
              alt="${meal.name}"
              loading="lazy"
            />
            <div class="absolute bottom-3 left-3 flex gap-2">
              <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700 shadow-sm">
                ${category}
              </span>
              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white shadow-sm">
                ${area}
              </span>
            </div>
          </div>
          <div class="p-4">
            <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
              ${meal.name}
            </h3>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2">
              Delicious healthy recipe. Click for full ingredients & nutrition facts.
            </p>
          </div>
        </div>
        <div class="px-4 pb-4">
          <div class="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
            <span class="font-semibold text-gray-700">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i> ${category}
            </span>
            <span class="font-semibold text-blue-600">
              <i class="fa-solid fa-globe mr-1"></i> ${area}
            </span>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  recipesGrid.querySelectorAll('.recipe-card').forEach(card => {
    card.addEventListener('click', () => {
      openMealDetail(card.dataset.mealId);
    });
  });
}

function renderProductsUI(products) {
  if (!productsGrid) return;

  if (!products || products.length === 0) {
    productsGrid.className = 'col-span-full';
    productsGrid.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-200 p-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-barcode text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-700 text-lg font-semibold">No products found</p>
        <p class="text-gray-400 text-sm mt-1">Try another search keyword or scan a valid barcode number</p>
      </div>
    `;
    return;
  }

  productsGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5';

  productsGrid.innerHTML = products
    .map(item => {
      const grade = (item.nutritionGrade || 'unknown').toUpperCase();
      let gradeColor = 'bg-gray-400';
      if (grade === 'A') gradeColor = 'bg-green-600';
      else if (grade === 'B') gradeColor = 'bg-lime-500';
      else if (grade === 'C') gradeColor = 'bg-yellow-500';
      else if (grade === 'D') gradeColor = 'bg-orange-500';
      else if (grade === 'E') gradeColor = 'bg-red-500';

      const nutrients = item.nutrients || {};
      const calories = Math.round(nutrients.calories || 0);
      const protein = Number(nutrients.protein || 0).toFixed(1);
      const carbs = Number(nutrients.carbs || 0).toFixed(1);
      const fat = Number(nutrients.fat || 0).toFixed(1);
      const sugar = Number(nutrients.sugar || 0).toFixed(1);

      const img = item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300';
      const brand = item.brand || 'Packaged Product';

      return `
      <div
        class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 flex flex-col justify-between"
        data-barcode="${item.barcode || ''}"
      >
        <div>
          <div class="relative h-44 bg-gray-50 flex items-center justify-center p-3 overflow-hidden">
            <img
              class="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              src="${img}"
              alt="${item.name}"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'"
            />
            <div class="absolute top-2 left-2 ${gradeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              Nutri-Score ${grade}
            </div>
            ${
              item.novaGroup
                ? `<div class="absolute top-2 right-2 bg-gray-800 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center" title="NOVA Group ${item.novaGroup}">
                    ${item.novaGroup}
                  </div>`
                : ''
            }
          </div>

          <div class="p-4">
            <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${brand}</p>
            <h3 class="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-tight">${item.name}</h3>
            <div class="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <span><i class="fa-solid fa-fire text-amber-500 mr-1"></i>${calories} kcal/100g</span>
            </div>

            <div class="grid grid-cols-4 gap-1 text-center mb-3">
              <div class="bg-emerald-50 rounded p-1">
                <p class="text-xs font-bold text-emerald-700">${protein}g</p>
                <p class="text-[10px] text-gray-500">Protein</p>
              </div>
              <div class="bg-blue-50 rounded p-1">
                <p class="text-xs font-bold text-blue-700">${carbs}g</p>
                <p class="text-[10px] text-gray-500">Carbs</p>
              </div>
              <div class="bg-purple-50 rounded p-1">
                <p class="text-xs font-bold text-purple-700">${fat}g</p>
                <p class="text-[10px] text-gray-500">Fat</p>
              </div>
              <div class="bg-orange-50 rounded p-1">
                <p class="text-xs font-bold text-orange-700">${sugar}g</p>
                <p class="text-[10px] text-gray-500">Sugar</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 pt-0">
          <button
            class="log-product-btn w-full py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i class="fa-solid fa-plus"></i> Add to Food Log
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  productsGrid.querySelectorAll('.log-product-btn').forEach((btn, index) => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      logProductToFoodLog(products[index]);
    });
  });
}

function renderFoodLogUI() {
  const todayData = getTodayTotals();
  const { calories, protein, carbs, fat, items } = todayData;

  const calPercent = Math.min(100, Math.round((calories / DAILY_GOALS.calories) * 100));
  const protPercent = Math.min(100, Math.round((protein / DAILY_GOALS.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((carbs / DAILY_GOALS.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((fat / DAILY_GOALS.fat) * 100));

  if (caloriesProgress) caloriesProgress.textContent = `${calories} / ${DAILY_GOALS.calories} kcal`;
  if (caloriesProgressBar) caloriesProgressBar.style.width = `${calPercent}%`;

  if (proteinProgress) proteinProgress.textContent = `${protein} / ${DAILY_GOALS.protein} g`;
  if (proteinProgressBar) proteinProgressBar.style.width = `${protPercent}%`;

  if (carbsProgress) carbsProgress.textContent = `${carbs} / ${DAILY_GOALS.carbs} g`;
  if (carbsProgressBar) carbsProgressBar.style.width = `${carbsPercent}%`;

  if (fatProgress) fatProgress.textContent = `${fat} / ${DAILY_GOALS.fat} g`;
  if (fatProgressBar) fatProgressBar.style.width = `${fatPercent}%`;

  if (loggedItemsHeading) loggedItemsHeading.textContent = `Logged Items (${items.length})`;
  if (clearFoodlog) clearFoodlog.style.display = items.length > 0 ? 'inline-flex' : 'none';

  if (!loggedItemsList) return;

  if (items.length === 0) {
    loggedItemsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium text-gray-700">No meals logged today</p>
        <p class="text-sm text-gray-400 mt-1">Add meals from the Recipes page or scan packaged products</p>
      </div>
    `;
    return;
  }

  loggedItemsList.innerHTML = items
    .map(item => {
      const time = new Date(item.loggedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
      const badgeColor =
        item.source === 'Recipe'
          ? 'bg-blue-100 text-blue-800'
          : item.source === 'Product'
          ? 'bg-amber-100 text-amber-800'
          : 'bg-purple-100 text-purple-800';

      return `
      <div class="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition-all border border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />`
                : `<i class="fa-solid fa-bowl-food text-gray-400 text-lg"></i>`
            }
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor}">${item.source}</span>
              <span class="text-xs text-gray-400">${time}</span>
            </div>
            <h5 class="text-sm font-bold text-gray-900 mt-0.5 line-clamp-1">${item.name}</h5>
            <div class="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span><strong class="text-emerald-700">${item.calories}</strong> kcal</span>
              <span>• P: ${item.protein}g</span>
              <span>• C: ${item.carbs}g</span>
              <span>• F: ${item.fat}g</span>
            </div>
          </div>
        </div>
        <button
          class="delete-log-btn text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
          data-id="${item.id}"
          title="Remove item"
        >
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    `;
    })
    .join('');

  loggedItemsList.querySelectorAll('.delete-log-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeLogEntry(btn.dataset.id);
      renderFoodLogUI();
      renderWeeklyChartUI();
    });
  });
}


function renderWeeklyChartUI() {
  if (!weeklyChart || typeof Plotly === 'undefined') return;

  const weeklyData = getWeeklyData();

  const trace = {
    x: weeklyData.days,
    y: weeklyData.calories,
    type: 'bar',
    marker: {
      color: '#10b981',
      line: { color: '#059669', width: 1 }
    },
    name: 'Consumed (kcal)'
  };

  const targetTrace = {
    x: weeklyData.days,
    y: weeklyData.days.map(() => 2000),
    type: 'scatter',
    mode: 'lines',
    name: '2000 kcal Target',
    line: { color: '#f59e0b', dash: 'dot', width: 2 }
  };

  const layout = {
    margin: { t: 25, r: 20, l: 45, b: 35 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    showlegend: true,
    legend: { orientation: 'h', y: 1.15, x: 0.1 },
    font: { family: 'Inter, sans-serif', size: 12, color: '#4b5563' },
    xaxis: { gridcolor: '#f3f4f6' },
    yaxis: { gridcolor: '#e5e7eb', title: 'kcal' }
  };

  const config = { responsive: true, displayModeBar: false };
  Plotly.newPlot(weeklyChart, [trace, targetTrace], layout, config);
}

function switchPage(page, updateHash = true) {
  currentPage = page;

  if (searchFiltersSection) searchFiltersSection.style.display = 'none';
  if (mealCategoriesSection) mealCategoriesSection.style.display = 'none';
  if (allRecipesSection) allRecipesSection.style.display = 'none';
  if (mealDetails) mealDetails.classList.add('hidden');
  if (productsSection) productsSection.classList.add('hidden');
  if (foodlogSection) foodlogSection.classList.add('hidden');

  if (page === 'meals') {
    if (searchFiltersSection) searchFiltersSection.style.display = '';
    if (mealCategoriesSection) mealCategoriesSection.style.display = '';
    if (allRecipesSection) allRecipesSection.style.display = '';
    if (pageHead) pageHead.textContent = 'Meals & Recipes';
    if (pageDesc) pageDesc.textContent = 'Discover delicious and nutritious recipes tailored for you';
    if (updateHash) window.location.hash = '#meals';
  } else if (page === 'products') {
    if (productsSection) productsSection.classList.remove('hidden');
    if (pageHead) pageHead.textContent = 'Product Scanner';
    if (pageDesc) pageDesc.textContent = 'Search packaged foods or scan barcodes to check nutrition and log items';
    if (updateHash) window.location.hash = '#products';
    if (!productsList || productsList.length === 0) {
      loadProductsByCategory('snacks');
    }
  } else if (page === 'foodlog') {
    if (foodlogSection) foodlogSection.classList.remove('hidden');
    if (pageHead) pageHead.textContent = 'Daily Food Log';
    if (pageDesc) pageDesc.textContent = 'Track and monitor your daily nutrition intake and hit your macro goals';
    if (updateHash) window.location.hash = '#foodlog';
    renderFoodLogUI();
    renderWeeklyChartUI();
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.dataset.page;
    if (linkPage === page) {
      link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all font-semibold';
    } else {
      link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all font-medium';
    }
  });

  sidebar?.classList.remove('open');
  sidebarOverlay?.classList.remove('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleRoute() {
  const hash = window.location.hash || '#meals';

  if (hash.startsWith('#meal?id=') || hash.startsWith('#meals?id=')) {
    const mealId = hash.split('id=')[1];
    if (mealId) {
      openMealDetail(mealId, false);
      return;
    }
  }


  if (hash === '#products') {
    switchPage('products', false);
  } else if (hash === '#foodlog') {
    switchPage('foodlog', false);
  } else {
    switchPage('meals', false);
  }
}

async function onSelectCategory(category) {
  activeCategory = category;
  activeArea = '';
  if (recipesCount) recipesCount.textContent = `Loading ${category} recipes...`;
  if (recipesTitle) recipesTitle.textContent = `${category} Recipes`;

  const meals = await filterByCategory(category, 25);
  mealsList = meals;
  renderMealsGridUI(mealsList);
  renderAreaFiltersUI(areasList);
}

async function onSelectArea(area) {
  activeArea = area;
  activeCategory = '';

  if (!area) {
    if (recipesCount) recipesCount.textContent = 'Loading all recipes...';
    if (recipesTitle) recipesTitle.textContent = 'All Recipes';
    mealsList = await searchMeals('', 25);
  } else {
    if (recipesCount) recipesCount.textContent = `Loading ${area} recipes...`;
    if (recipesTitle) recipesTitle.textContent = `${area} Recipes`;
    mealsList = await filterByArea(area, 25);
  }

  renderMealsGridUI(mealsList);
  renderAreaFiltersUI(areasList);
}



function handleRecipeSearch(query) {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    if (recipesCount) recipesCount.textContent = 'Searching recipes...';
    mealsList = await searchMeals(query, 25);
    renderMealsGridUI(mealsList);
  }, 300);
}

function extractIngredients(meal) {
  if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
    return meal.ingredients.filter(i => i.ingredient && i.ingredient.trim());
  }
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`] || '';
    if (ing && ing.trim()) {
      list.push({ ingredient: ing.trim(), measure: measure.trim() });
    }
  }
  return list;
}

function extractInstructions(meal) {
  if (Array.isArray(meal.instructions) && meal.instructions.length > 0) {
    return meal.instructions;
  }
  if (typeof meal.strInstructions === 'string') {
    return meal.strInstructions
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }
  return ['Follow standard preparation methods for this recipe.'];
}

function extractYoutubeId(url) {
  if (!url) return null;
  if (url.includes('v=')) {
    const parts = url.split('v=')[1];
    return parts.split('&')[0];
  }
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/')[1];
    return parts.split('?')[0];
  }
  if (url.includes('embed/')) {
    const parts = url.split('embed/')[1];
    return parts.split('?')[0];
  }
  return null;
}

async function fetchAndRenderNutrition(meal, ingredients) {
  const formattedIngredients = ingredients.map(i => `${i.measure || ''} ${i.ingredient || ''}`.trim());

  if (nutritionCalServing) nutritionCalServing.textContent = '...';
  if (nutritionCalTotal) nutritionCalTotal.textContent = 'Calculating...';

  const nutritionData = await analyzeRecipe(meal.name, formattedIngredients);

  let perServing = null;
  let totals = null;

  if (nutritionData && nutritionData.perServing) {
    perServing = nutritionData.perServing;
    totals = nutritionData.totals || { calories: perServing.calories * 4 };
  } else {
    perServing = {
      calories: 450,
      protein: 34,
      carbs: 48,
      fat: 14,
      fiber: 5,
      sugar: 8
    };
    totals = { calories: 1800 };
  }


  currentMealNutrition = perServing;

  if (heroCalories) heroCalories.textContent = `${perServing.calories} cal/serving`;
  if (caloriesText) caloriesText.textContent = perServing.calories;
  if (caloriesTotal) caloriesTotal.textContent = `Total: ${totals.calories} cal`;

  if (proteinVal) proteinVal.textContent = `${perServing.protein}g`;
  if (proteinBarVal) proteinBarVal.style.width = `${Math.min(100, Math.round((perServing.protein / 50) * 100))}%`;

  if (carbsVal) carbsVal.textContent = `${perServing.carbs}g`;
  if (carbsBar) carbsBar.style.width = `${Math.min(100, Math.round((perServing.carbs / 250) * 100))}%`;

  if (fatVal) fatVal.textContent = `${perServing.fat}g`;
  if (fatBarVal) fatBarVal.style.width = `${Math.min(100, Math.round((perServing.fat / 65) * 100))}%`;

  if (fiberVal) fiberVal.textContent = `${perServing.fiber || 4}g`;
  if (fiberBarVal) fiberBarVal.style.width = `${Math.min(100, Math.round(((perServing.fiber || 4) / 30) * 100))}%`;

  if (sugarVal) sugarVal.textContent = `${perServing.sugar || 6}g`;
  if (sugarBar) sugarBar.style.width = `${Math.min(100, Math.round(((perServing.sugar || 6) / 50) * 100))}%`;
}

async function openMealDetail(mealId, updateHash = true) {
  if (updateHash) {
    window.location.hash = `#meal?id=${mealId}`;
  }

  if (searchFiltersSection) searchFiltersSection.style.display = 'none';
  if (mealCategoriesSection) mealCategoriesSection.style.display = 'none';
  if (allRecipesSection) allRecipesSection.style.display = 'none';
  if (productsSection) productsSection.classList.add('hidden');
  if (foodlogSection) foodlogSection.classList.add('hidden');
  if (mealDetails) mealDetails.classList.remove('hidden');

  const meal = await getMealById(mealId);
  if (!meal) {
    Swal.fire({
      icon: 'error',
      title: 'Recipe not found',
      text: 'Unable to load recipe details. Returning to recipes.'
    });
    switchPage('meals');
    return;
  }

  currentMeal = meal;

  if (heroImg) heroImg.src = meal.thumbnail || '';
  if (receipeTitle) receipeTitle.textContent = meal.name;

  if (heroTag) {
    heroTag.innerHTML = `
      <span class="px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">${meal.category || 'Recipe'}</span>
      <span class="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm">${meal.area || 'International'}</span>
      ${meal.tags ? `<span class="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full shadow-sm">${meal.tags}</span>` : ''}
    `;
  }

  if (heroServings) heroServings.textContent = '4 servings';
  if (heroCalories) heroCalories.textContent = 'Analyzing nutrition...';

  const ingredients = extractIngredients(meal);
  if (detailIngredientsCount) detailIngredientsCount.textContent = `${ingredients.length} items`;
  if (detailIngredientsGrid) {
    detailIngredientsGrid.innerHTML = ingredients
      .map(
        ing => `
        <label class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer">
          <input
            type="checkbox"
            class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
          />
          <span class="text-gray-700 text-sm">
            <span class="font-bold text-gray-900">${ing.measure}</span> ${ing.ingredient}
          </span>
        </label>
      `
      )
      .join('');
  }

  const instructions = extractInstructions(meal);
  if (detailInstructionsList) {
    detailInstructionsList.innerHTML = instructions
      .map(
        (step, i) => `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-sm shadow-sm">
            ${i + 1}
          </div>
          <p class="text-gray-700 leading-relaxed pt-1.5 text-sm">
            ${step}
          </p>
        </div>
      `
      )
      .join('');
  }

  if (meal.youtube && videoIframe && videoCard) {
    const videoId = extractYoutubeId(meal.youtube);
    if (videoId) {
      videoCard.style.display = '';
      videoIframe.src = `https://www.youtube.com/embed/${videoId}`;
    } else {
      videoCard.style.display = 'none';
    }
  } else if (videoCard) {
    videoCard.style.display = 'none';
  }

  await fetchAndRenderNutrition(meal, ingredients);
}

function logCurrentMeal() {
  if (!currentMeal) return;

  const nutrition = currentMealNutrition || {
    calories: 450,
    protein: 30,
    carbs: 45,
    fat: 12
  };

  addLogEntry({
    name: currentMeal.name,
    source: 'Recipe',
    image: currentMeal.thumbnail || '',
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat
  });



  Swal.fire({
    icon: 'success',
    title: 'Meal Logged!',
    text: `Added "${currentMeal.name}" (${nutrition.calories} kcal) to today's Food Log.`,
    confirmButtonColor: '#10b981',
    showCancelButton: true,
    confirmButtonText: 'View Food Log',
    cancelButtonText: 'Keep Browsing'
  }).then(result => {
    if (result.isConfirmed) {
      switchPage('foodlog');
    }
  });
}

async function searchProductsByName(query) {
  if (!query || !query.trim()) return;
  if (productsCount) productsCount.textContent = `Searching for "${query}"...`;

  productsList = await searchProducts(query.trim(), 24);
  filterProductsByGrade(selectedNutriGrade);
}

async function lookupProductByBarcode(barcode) {
  if (!barcode || !barcode.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Enter Barcode',
      text: 'Please type or paste a barcode number (e.g. 7613034626844 or 3017620422003)'
    });
    return;
  }

  if (productsCount) productsCount.textContent = `Looking up barcode ${barcode}...`;

  const product = await getProductByBarcode(barcode.trim());
  if (product) {
    productsList = [product];
    filterProductsByGrade('');
    if (productsCount) productsCount.textContent = `Found product for barcode: ${barcode}`;
  } else {
    productsList = [];
    renderProductsUI([]);
    if (productsCount) productsCount.textContent = 'No product found with this barcode';
  }
}

async function loadProductsByCategory(category) {
  if (productsCount) productsCount.textContent = `Loading ${category}...`;
  productsList = await getProductsByCategory(category, 24);
  filterProductsByGrade(selectedNutriGrade);
}

function filterProductsByGrade(grade) {
  selectedNutriGrade = grade;
  let filtered = productsList;
  if (grade) {
    filtered = filtered.filter(p => (p.nutritionGrade || '').toLowerCase() === grade.toLowerCase());
  }

  if (productsCount) {
    productsCount.textContent = `Showing ${filtered.length} products`;
  }

  renderProductsUI(filtered);
}


function logProductToFoodLog(product) {
  const nutrients = product.nutrients || {};
  const calories = Math.round(nutrients.calories || 200);
  const protein = Math.round(nutrients.protein || 5);
  const carbs = Math.round(nutrients.carbs || 30);
  const fat = Math.round(nutrients.fat || 8);

  addLogEntry({
    name: `${product.brand ? product.brand + ' - ' : ''}${product.name}`,
    source: 'Product',
    image: product.image || '',
    calories: calories,
    protein: protein,
    carbs: carbs,
    fat: fat
  });


  Swal.fire({
    icon: 'success',
    title: 'Product Logged!',
    text: `Added "${product.name}" (${calories} kcal) to today's Food Log.`,
    confirmButtonColor: '#10b981',
    showCancelButton: true,
    confirmButtonText: 'Go to Food Log',
    cancelButtonText: 'Scan More'
  }).then(result => {
    if (result.isConfirmed) {
      switchPage('foodlog');
    }
  });
}

function promptCustomFoodEntry() {
  Swal.fire({
    title: 'Add Custom Food Item',
    html: `
      <div class="text-left space-y-3 pt-2">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Food / Drink Name</label>
          <input id="swal-food-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., Greek Yogurt with Honey" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Calories (kcal)</label>
            <input id="swal-food-cal" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="250" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Protein (g)</label>
            <input id="swal-food-prot" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="15" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Carbs (g)</label>
            <input id="swal-food-carbs" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="30" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Fat (g)</label>
            <input id="swal-food-fat" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="5" />
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Save to Log',
    confirmButtonColor: '#10b981',
    preConfirm: () => {
      const name = document.getElementById('swal-food-name').value.trim();
      const cal = document.getElementById('swal-food-cal').value;
      const prot = document.getElementById('swal-food-prot').value;
      const carbs = document.getElementById('swal-food-carbs').value;
      const fat = document.getElementById('swal-food-fat').value;

      if (!name) {
        Swal.showValidationMessage('Please enter a food name');
        return false;
      }
      return { name, calories: cal || 0, protein: prot || 0, carbs: carbs || 0, fat: fat || 0 };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      addLogEntry({
        name: result.value.name,
        source: 'Custom',
        image: '',
        calories: result.value.calories,
        protein: result.value.protein,
        carbs: result.value.carbs,
        fat: result.value.fat
      });
      renderFoodLogUI();
      renderWeeklyChartUI();
      Swal.fire({
        icon: 'success',
        title: 'Custom Item Added!',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

function bindEvents() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchPage(link.dataset.page);
    });
  });

  headerMenuBtn?.addEventListener('click', () => {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('active');
  });

  sidebarCloseBtn?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
  });

  sidebarOverlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
  });

  searchInput?.addEventListener('input', e => {
    handleRecipeSearch(e.target.value);
  });

  gridViewBtn?.addEventListener('click', () => {
    isGridView = true;
    gridViewBtn.classList.add('bg-white', 'shadow-sm');
    listViewBtn.classList.remove('bg-white', 'shadow-sm');
    renderMealsGridUI(mealsList);
  });

  listViewBtn?.addEventListener('click', () => {
    isGridView = false;
    listViewBtn.classList.add('bg-white', 'shadow-sm');
    gridViewBtn.classList.remove('bg-white', 'shadow-sm');
    renderMealsGridUI(mealsList);
  });

  backToMealsBtn?.addEventListener('click', () => {
    switchPage('meals');
  });

  logMealBtn?.addEventListener('click', () => {
    logCurrentMeal();
  });

  searchProductBtn?.addEventListener('click', () => {
    searchProductsByName(productSearchInput?.value || '');
  });

  productSearchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      searchProductsByName(productSearchInput?.value || '');
    }
  });

  lookupBarcodeBtn?.addEventListener('click', () => {
    lookupProductByBarcode(barcodeInput?.value || '');
  });

  barcodeInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      lookupProductByBarcode(barcodeInput?.value || '');
    }
  });

  document.querySelectorAll('.nutri-score-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nutri-score-filter').forEach(b => {
        b.className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer';
      });
      btn.className = 'nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white cursor-pointer';
      filterProductsByGrade(btn.dataset.grade || '');
    });
  });



  document.querySelectorAll('.product-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadProductsByCategory(btn.dataset.category || 'snacks');
    });
  });

  
  clearFoodlog?.addEventListener('click', () => {
    Swal.fire({
      title: "Clear Today's Food Log?",
      text: 'This will remove all items logged today.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, clear all'
    }).then(result => {
      if (result.isConfirmed) {
        clearAllLogs();
        renderFoodLogUI();
        renderWeeklyChartUI();
      }
    });
  });

  quickLogMealBtn?.addEventListener('click', () => {
    switchPage('meals');
  });

  quickScanProductBtn?.addEventListener('click', () => {
    switchPage('products');
  });

  quickCustomEntryBtn?.addEventListener('click', () => {
    promptCustomFoodEntry();
  });
}



async function init() {
  bindEvents();




  if (foodlogDate) {
    foodlogDate.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }

  handleRoute();
  window.addEventListener('hashchange', handleRoute);

  try {
    const [categories, areas, meals] = await Promise.all([
      getCategories(),
      getAreas(),
      searchMeals('', 25)
    ]);

    categoriesList = categories;
    areasList = areas;
    mealsList = meals;

    renderCategoriesUI(categoriesList);
    renderAreaFiltersUI(areasList);
    renderMealsGridUI(mealsList);
  } catch (e) {
    console.error('Initial data loading error:', e);
  }

  if (appLoadingOverlay) {
    appLoadingOverlay.style.opacity = '0';
    setTimeout(() => {
      appLoadingOverlay.style.display = 'none';
    }, 400);
  }
}



if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

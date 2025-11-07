// ========= helpers =========
const $ = (q) => document.querySelector(q);
const results = $("#results");
const empty = $("#empty");
const countEl = $("#resultCount");
const lastSearchEl = $("#lastSearch");
const toast = $("#toast");
const modal = $("#modal");
const modalContent = $("#modalContent");
$("#closeModal").onclick = () => modal.close();

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

function skeletonGrid(n = 8) {
  results.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const s = document.createElement("div");
    s.className = "skeleton";
    results.appendChild(s);
  }
}

// ========= dropdowns =========
async function loadDropdowns() {
  try {
    const [catsRes, areasRes] = await Promise.all([
      fetch("https://www.themealdb.com/api/json/v1/1/list.php?c=list"),
      fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list"),
    ]);
    const cats = (await catsRes.json()).meals || [];
    const areas = (await areasRes.json()).meals || [];

    const catSel = $("#categorySelect");
    const areaSel = $("#areaSelect");

    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.strCategory;
      opt.textContent = c.strCategory;
      catSel.appendChild(opt);
    });
    areas.forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.strArea;
      opt.textContent = a.strArea;
      areaSel.appendChild(opt);
    });
  } catch (e) {
    showToast("Failed to load options. Check your connection.");
  }
}

// ========= fetch & fuse =========
async function fetchMealsBy(type, value) {
  const url =
    type === "category"
      ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
          value
        )}`
      : `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          value
        )}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals || [];
}

function renderMeals(list) {
  results.innerHTML = "";
  countEl.textContent = list.length;
  if (!list.length) {
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  const frag = document.createDocumentFragment();
  list.forEach((meal) => {
    const card = document.createElement("article");
    card.className = "card recipe reveal";
    card.innerHTML = `
      <span class="badge">FUSION</span>
      <img loading="lazy" src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="meta">
        <div class="title">${meal.strMeal}</div>
        <a class="cta" href="#" data-id="${meal.idMeal}">View details →</a>
      </div>
    `;
    frag.appendChild(card);
  });
  results.appendChild(frag);

  // attach modal handlers
  results.querySelectorAll(".cta").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDetails(e.currentTarget.dataset.id);
    })
  );

  // reveal animation
  observeReveals();
}

async function openDetails(id) {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const data = await res.json();
    const meal = data.meals?.[0];
    if (!meal) return;

    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const mea = meal[`strMeasure${i}`];
      if (ing && ing.trim() !== "") ings.push(`${ing} — ${mea || ""}`.trim());
    }

    modalContent.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="modal-body">
        <h3 style="margin:4px 0 8px">${meal.strMeal}</h3>
        <div class="kv">
          <span class="pill">Category: ${meal.strCategory || "-"}</span>
          <span class="pill">Cuisine: ${meal.strArea || "-"}</span>
        </div>
        <h4>Ingredients</h4>
        <ul style="margin:8px 0 14px;padding-left:18px">
          ${ings.map((i) => `<li>${i}</li>`).join("")}
        </ul>
        <h4>Instructions</h4>
        <p style="white-space:pre-wrap;line-height:1.55">${meal.strInstructions?.trim() || "—"}</p>
      </div>
    `;
    modal.showModal();
  } catch {
    showToast("Couldn't load details. Try again.");
  }
}

async function runSearch() {
  const category = $("#categorySelect").value;
  const area = $("#areaSelect").value;
  if (!category || !area) {
    showToast("Select both category and cuisine.");
    return;
  }
  lastSearchEl.textContent = `${category} × ${area}`;
  skeletonGrid(8);

  try {
    const [catMeals, areaMeals] = await Promise.all([
      fetchMealsBy("category", category),
      fetchMealsBy("area", area),
    ]);

    // intersect by idMeal
    const idSet = new Set(catMeals.map((m) => m.idMeal));
    const fusion = areaMeals.filter((m) => idSet.has(m.idMeal));

    renderMeals(fusion);
  } catch (e) {
    countEl.textContent = "0";
    empty.classList.remove("hidden");
    showToast("Fetch failed. Network issue?");
  }
}

// ========= fun extras =========
function randomizeSelects() {
  const catSel = $("#categorySelect");
  const areaSel = $("#areaSelect");
  const rand = (sel) => sel.options[Math.floor(Math.random() * (sel.length - 1)) + 1].value;
  if (catSel.length > 1) catSel.value = rand(catSel);
  if (areaSel.length > 1) areaSel.value = rand(areaSel);
  showToast("Shuffled! Hit Find.");
}

// scroll reveal
function observeReveals(){
  const obs = new IntersectionObserver((entries, io) => {
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.transform="translateY(0)";
        e.target.style.opacity="1";
        io.unobserve(e.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>{
    el.style.transform="translateY(10px)";
    el.style.opacity=".0";
    el.style.transition="opacity .5s ease, transform .5s ease";
    obs.observe(el);
  });
}

// ========= wire up =========
document.addEventListener("DOMContentLoaded", async () => {
  await loadDropdowns();
  $("#findRecipes").addEventListener("click", runSearch);
  $("#shuffle").addEventListener("click", randomizeSelects);
  // Enter to search
  ["#categorySelect", "#areaSelect"].forEach(sel =>
    $(sel).addEventListener("keydown", (e)=>{ if(e.key==="Enter") runSearch(); })
  );
});

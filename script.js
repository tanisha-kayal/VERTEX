const cuisineData = {
  Indian: [
    { name: "Roti Base", color: "#f4c430" },
    { name: "Curry", color: "#e67e22" },
    { name: "Paneer", color: "#f9e79f" },
    { name: "Coriander", color: "#27ae60" },
  ],
  Italian: [
    { name: "Pasta Base", color: "#f7dc6f" },
    { name: "Tomato Sauce", color: "#c0392b" },
    { name: "Cheese", color: "#fef5e7" },
    { name: "Herbs", color: "#27ae60" },
  ],
  Japanese: [
    { name: "Rice", color: "#fdfefe" },
    { name: "Seaweed", color: "#145a32" },
    { name: "Salmon", color: "#ff6f61" },
    { name: "Sesame", color: "#f9e79f" },
  ],
  Mexican: [
    { name: "Taco Shell", color: "#f4d03f" },
    { name: "Beans", color: "#6e2c00" },
    { name: "Lettuce", color: "#27ae60" },
    { name: "Salsa", color: "#e74c3c" },
    { name: "Cheese", color: "#f9e79f" },
  ],
  American: [
    { name: "Bottom Bun", color: "#d68910" },
    { name: "Lettuce", color: "#27ae60" },
    { name: "Patty", color: "#784212" },
    { name: "Cheese", color: "#f1c40f" },
    { name: "Top Bun", color: "#d68910" },
  ],
  Chinese: [
    { name: "Noodles", color: "#f7dc6f" },
    { name: "Sauce", color: "#e74c3c" },
    { name: "Veggies", color: "#52be80" },
    { name: "Spring Onion", color: "#1e8449" },
  ],
};

const select = document.getElementById("cuisineSelect");
const animationArea = document.getElementById("animationArea");
const cuisineName = document.getElementById("cuisineName");

function showCuisine(cuisine) {
  cuisineName.textContent = cuisine;
  animationArea.innerHTML = ""; // Clear previous layers

  const layers = cuisineData[cuisine];

  layers.forEach((layer, index) => {
    const div = document.createElement("div");
    div.classList.add("layer");
    div.style.background = layer.color;
    div.style.animationDelay = ${index * 0.3}s;
    div.title = layer.name;
    animationArea.appendChild(div);
  });
}

// Default view
showCuisine("Indian");

// Change animation on select
select.addEventListener("change", (e) => {
  showCuisine(e.target.value);
});
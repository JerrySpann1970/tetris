const grid = document.getElementById("grid");

// Create 200 divs (20 rows x 10 columns)
for (let i = 0; i < 200; i++) {
    const cell = document.createElement("div");
    grid.appendChild(cell);
}


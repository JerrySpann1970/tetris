document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById("grid");
    const width = 10;
    const height = 20;
    const cells = [];
    let score = 0;
    const scoreDisplay = document.getElementById("score");

    // Create 200 divs for grid and store in cells[]
    for (let i = 0; i < width * height; i++) {
        const cell = document.createElement("div");
        grid.appendChild(cell);
        cells.push(cell);
    }

    // Tetromino shapes with their rotations
    const lTetromino = [
        [0, width, width * 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2],
        [0, 1, width + 1, width * 2 + 1],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, 1, width + 1, width + 2],
        [2, width + 1, width + 2, width * 2 + 1],
        [0, 1, width + 1, width + 2],
        [2, width + 1, width + 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [0, width, width * 2, width * 3],
        [width, width + 1, width + 2, width + 3],
        [0, width, width * 2, width * 3],
        [width, width + 1, width + 2, width + 3]
    ];

    const sTetromino = [
        [1, 2, width, width + 1],
        [0, width, width + 1, width * 2 + 1],
        [1, 2, width, width + 1],
        [0, width, width + 1, width * 2 + 1]
    ];

    const jTetromino = [
        [0, width, width * 2, width * 2 + 1],        // rotation 0
        [width, width + 1, width + 2, 2],            // rotation 1
        [0, 1, width + 1, width * 2 + 1],            // rotation 2
        [width, width * 2, width * 2 + 1, width * 2 + 2]  // rotation 3
    ];

    const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino, sTetromino, jTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * tetrominoes.length);
    let current = tetrominoes[random][currentRotation];
    let timerId;

    // Draw the current tetromino
    function draw() {
        current.forEach(index => {
            cells[currentPosition + index].classList.add('tetromino');
        });
    }

    // Remove the current tetromino from the grid
    function undraw() {
        current.forEach(index => {
            cells[currentPosition + index].classList.remove('tetromino');
        });
    }

    // Move down every second
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // Freeze the tetromino if it hits bottom or another frozen block
    function freeze() {
        if (current.some(index =>
            cells[currentPosition + index + width]?.classList.contains('taken') ||
            currentPosition + index + width >= width * height
        )) {
            current.forEach(index => cells[currentPosition + index].classList.add('taken'));

            // Start new tetromino
            random = Math.floor(Math.random() * tetrominoes.length);
            currentRotation = 0;
            current = tetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    // Move tetromino left unless at edge or blocked
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;

        if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    // Move tetromino right unless at edge or blocked
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;

        if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    // Rotate tetromino unless blocked or off edge
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) {
            currentRotation = 0;
        }
        current = tetrominoes[random][currentRotation];

        // Check edge collisions and adjust
        while (current.some(index => (currentPosition + index) % width === width - 1) &&
            current.some(index => (currentPosition + index) % width === 0)) {
            currentPosition--;
        }
        if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            rotate(); // revert rotation by recursive call until fits, simple approach
        }
        draw();
    }

    // Listen for keyboard controls
    function control(e) {
        if (e.key === "ArrowLeft") {
            moveLeft();
        } else if (e.key === "ArrowRight") {
            moveRight();
        } else if (e.key === "ArrowDown") {
            moveDown();
        } else if (e.key === "ArrowUp") {
            rotate();
        }
    }
    document.addEventListener('keydown', control);

    // Add score and clear full rows
    function addScore() {
        for (let i = 0; i < height; i++) {
            const rowIndices = [];
            for (let j = 0; j < width; j++) {
                rowIndices.push(i * width + j);
            }

            if (rowIndices.every(index => cells[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerText = score;

                // Remove classes and elements from that row
                rowIndices.forEach(index => {
                    cells[index].classList.remove('taken', 'tetromino');
                    cells[index].style.backgroundColor = '';
                });

                // Remove those divs from the grid and add at top
                const removed = cells.splice(i * width, width);
                cells.unshift(...removed);

                // Remove all divs from grid and re-append in new order
                while (grid.firstChild) {
                    grid.removeChild(grid.firstChild);
                }
                cells.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    // Check for game over (blocks in first row)
    function gameOver() {
        if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerText = 'Game Over';
            clearInterval(timerId);
            document.removeEventListener('keydown', control);
        }
    }

    // Start the game
    draw();
    timerId = setInterval(moveDown, 1000);
});

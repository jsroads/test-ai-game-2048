class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.init();
        this.initTouchEvents();
    }

    initTouchEvents() {
        const container = document.querySelector('.grid-container');
        let startX, startY;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.move('right');
                    } else {
                        this.move('left');
                    }
                }
            } else {
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.move('down');
                    } else {
                        this.move('up');
                    }
                }
            }
        });
    }

    init() {
        this.score = 0;
        this.updateScore();
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.addNewTile();
        this.addNewTile();
        this.renderGrid();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    renderGrid() {
        const container = document.querySelector('.grid-container');
        const cells = container.getElementsByClassName('grid-cell');
        const tiles = container.getElementsByClassName('tile');
        const oldTiles = {};
        
        // 保存旧的数字块位置
        Array.from(tiles).forEach(tile => {
            const value = parseInt(tile.textContent);
            const top = tile.style.top;
            const left = tile.style.left;
            oldTiles[`${top},${left}`] = {
                element: tile,
                value: value
            };
        });

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] !== 0) {
                    const spacing = window.innerWidth <= 500 ? 80 : 115;
                    const padding = window.innerWidth <= 500 ? 10 : 15;
                    const top = `${i * spacing + padding}px`;
                    const left = `${j * spacing + padding}px`;
                    const key = `${top},${left}`;
                    
                    if (oldTiles[key] && oldTiles[key].value === this.grid[i][j]) {
                        // 如果位置相同且数值相同，保留原有数字块
                        delete oldTiles[key];
                    } else {
                        // 创建新的数字块
                        const tile = document.createElement('div');
                        tile.className = `tile tile-${this.grid[i][j]}`;
                        tile.textContent = this.grid[i][j];
                        tile.style.top = top;
                        tile.style.left = left;
                        container.appendChild(tile);
                    }
                }
            }
        }
        
        // 移除旧的数字块
        Object.values(oldTiles).forEach(({element}) => {
            element.remove();
        });
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addNewTile();
            this.renderGrid();
            if (this.isGameOver()) {
                alert('游戏结束！');
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) {
                row.push(0);
            }
            if (row.join(',') !== this.grid[i].join(',')) {
                moved = true;
            }
            this.grid[i] = row;
        }
        this.updateScore();
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) {
                row.unshift(0);
            }
            if (row.join(',') !== this.grid[i].join(',')) {
                moved = true;
            }
            this.grid[i] = row;
        }
        this.updateScore();
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (column.length < 4) {
                column.push(0);
            }
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        this.updateScore();
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            while (column.length < 4) {
                column.unshift(0);
            }
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) {
                    moved = true;
                }
                this.grid[i][j] = column[i];
            }
        }
        this.updateScore();
        return moved;
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            document.getElementById('best-score').textContent = this.bestScore;
        }
    }

    isGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
                if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) return false;
                if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) return false;
            }
        }
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();

    document.getElementById('new-game').addEventListener('click', () => {
        game.init();
    });

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                game.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                game.move('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                game.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                game.move('right');
                break;
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                game.move('right');
            } else {
                game.move('left');
            }
        } else {
            if (dy > 0) {
                game.move('down');
            } else {
                game.move('up');
            }
        }
    });
});
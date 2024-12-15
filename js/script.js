function Player(mark, displayMark) {
    this.mark = mark; 
    this.displayMark = displayMark; 
}

function Space(x, y) {
    this.x = x;
    this.y = y;
    this.markedBy = null;

    this.mark = function (player) {
        if (!this.markedBy) {
            this.markedBy = player.mark;
        }
    };

    this.markedByPlayer = function () {
        return this.markedBy;
    };
}

function Board() {
    this.spaces = [];
    for (let x = 1; x <= 3; x++) {
        for (let y = 1; y <= 3; y++) {
            this.spaces.push(new Space(x, y));
        }
    }

    this.find = function (x, y) {
        return this.spaces.find(function (space) {
            return space.x === x && space.y === y;
        });
    };

    this.checkWin = function () {
        const winningLines = [
            [[1, 1], [1, 2], [1, 3]],
            [[2, 1], [2, 2], [2, 3]],
            [[3, 1], [3, 2], [3, 3]],
            [[1, 1], [2, 1], [3, 1]],
            [[1, 2], [2, 2], [3, 2]],
            [[1, 3], [2, 3], [3, 3]],
            [[1, 1], [2, 2], [3, 3]],
            [[1, 3], [2, 2], [3, 1]],
        ];

        for (let line of winningLines) {
            const [a, b, c] = line.map(([x, y]) => this.find(x, y).markedByPlayer());
            if (a && a === b && b === c) {
                return a; 
            }
        }
        return null;
    };

    this.isFull = function () {
        return this.spaces.every(function (space) {
            return space.markedByPlayer() !== null;
        });
    };
}

function TicTacToeGame(mode) {
    const player1 = new Player(1, "X");
    const player2 = new Player(2, "O");
    const board = new Board();
    let currentPlayer = player1;

    const boardElement = document.getElementById("board");
    const messageElement = document.getElementById("message");
    const restartButton = document.getElementById("restart");

    function initializeBoard() {
        boardElement.innerHTML = "";
        board.spaces.forEach(function (space, index) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.index = index;

            cell.addEventListener("click", function () {
                handleMove(space, cell);
            });

            boardElement.appendChild(cell);
        });
    }

    function handleMove(space, cell) {
        if (!space.markedByPlayer()) {
            space.mark(currentPlayer);
            cell.textContent = currentPlayer.displayMark;

            const winner = board.checkWin();
            if (winner) {
                const winnerDisplay = winner === 1 ? "X" : "O";
                alert(`Player ${winnerDisplay} wins!`);
                messageElement.textContent = `Player ${winnerDisplay} wins!`;
                endGame();
                return;
            } else if (board.isFull()) {
                alert("It's a draw!");
                messageElement.textContent = "It's a draw!";
                endGame();
                return;
            }

            currentPlayer = currentPlayer === player1 ? player2 : player1;
            messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;

            if (mode === "AI" && currentPlayer === player2) {
                setTimeout(makeAIMove, 500);
            }
        }
    }

    function makeAIMove() {
        const availableSpaces = board.spaces.filter(space => !space.markedByPlayer());
        if (availableSpaces.length > 0) {
            const randomSpace = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
            const cell = document.querySelector(`.cell[data-index='${board.spaces.indexOf(randomSpace)}']`);
            handleMove(randomSpace, cell);
        }
    }

    function endGame() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(function (cell) {
            cell.classList.add("taken");
        });
    }

    restartButton.addEventListener("click", function () {
        currentPlayer = player1;
        messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
        board.spaces.forEach(function (space) {
            space.markedBy = null;
        });
        initializeBoard();
    });

    initializeBoard();
    messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
}

// Menu Logic
const menuElement = document.getElementById("menu");
const gameElement = document.getElementById("game");
const playHumanButton = document.getElementById("playHuman");
const playAIButton = document.getElementById("playAI");

playHumanButton.addEventListener("click", function () {
    menuElement.classList.remove("active");
    gameElement.classList.add("active");
    new TicTacToeGame("human");
});

playAIButton.addEventListener("click", function () {
    menuElement.classList.remove("active");
    gameElement.classList.add("active");
    new TicTacToeGame("AI");
});

window.onload = function () {
    menuElement.classList.add("active");
};
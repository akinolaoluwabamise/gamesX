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
        return this.spaces.find(space => space.x === x && space.y === y);
    };

    this.checkWin = function () {
        const winningLines = [
            [[1, 1], [1, 2], [1, 3]], // Rows
            [[2, 1], [2, 2], [2, 3]],
            [[3, 1], [3, 2], [3, 3]],
            [[1, 1], [2, 1], [3, 1]], // Columns
            [[1, 2], [2, 2], [3, 2]],
            [[1, 3], [2, 3], [3, 3]],
            [[1, 1], [2, 2], [3, 3]], // Diagonals
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
        return this.spaces.every(space => space.markedByPlayer() !== null);
    };

    this.getAvailableSpaces = function () {
        return this.spaces.filter(space => space.markedByPlayer() === null);
    };
}

function TicTacToeGame(aiMode = false) {
    const player1 = new Player(1, "X");
    const player2 = new Player(2, "O");
    const board = new Board();
    let currentPlayer = player1;
    const isAIEnabled = aiMode;

    const boardElement = document.getElementById("board");
    const messageElement = document.getElementById("message");
    const restartButton = document.getElementById("restart");
    const controls = document.getElementById("controls");

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

            if (isAIEnabled && currentPlayer === player2) {
                aiMove();
            } else {
                messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
            }
        }
    }

    function aiMove() {
        const bestMove = minimax(board, player2).space;
        const cell = boardElement.children[board.spaces.indexOf(bestMove)];
        bestMove.mark(currentPlayer);
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

        currentPlayer = player1;
        messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
    }

    function minimax(board, player) {
        const availableSpaces = board.getAvailableSpaces();

        if (board.checkWin() === player1.mark) return { score: -10 };
        if (board.checkWin() === player2.mark) return { score: 10 };
        if (board.isFull()) return { score: 0 };

        const moves = [];

        for (let space of availableSpaces) {
            space.mark(player);
            const result = minimax(board, player === player1 ? player2 : player1);
            moves.push({ space, score: result.score });
            space.markedBy = null;
        }

        return player === player2
            ? moves.reduce((best, move) => (move.score > best.score ? move : best))
            : moves.reduce((best, move) => (move.score < best.score ? move : best));
    }

    function endGame() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => cell.classList.add("taken"));
    }

    restartButton.addEventListener("click", function () {
        currentPlayer = player1;
        messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
        board.spaces.forEach(space => (space.markedBy = null));
        initializeBoard();
    });

    initializeBoard();
    messageElement.textContent = `Player ${currentPlayer.displayMark}'s turn`;
    controls.style.display = "none";
    restartButton.style.display = "block";
}

window.onload = function () {
    document.getElementById("playHuman").addEventListener("click", function () {
        new TicTacToeGame(false);
    });

    document.getElementById("playAI").addEventListener("click", function () {
        new TicTacToeGame(true);
    });
};

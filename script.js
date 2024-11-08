const displayController = (function() {
    const updateName = (player, name) => {
        const playerElement = document.querySelector(`.${player} p`);

        playerElement.textContent = name;
    }
    const updateBoxSymbol = (boxPositionNumber, symbol) => {
        const box = document.querySelector(`[data-pos='${boxPositionNumber}'] span`);

        box.textContent = symbol;
        box.classList.add('active');
    }
    const restartGameBoard = () => {
        const p1ScoreElement = document.querySelector('.score.p1');
        const p2ScoreElement = document.querySelector('.score.p2');
        const gridBoxElements = document.querySelectorAll('.grid-boxes')

        p1ScoreElement.textContent = 0;
        p2ScoreElement.textContent = 0;

        gridBoxElements.forEach((box) => {
            const boxSpan = box.querySelector('span');

            boxSpan.classList.remove('active');
            boxSpan.textContent = '';
        });
    }
    const resetScore = () => {
        const p1Score = document.querySelector('.score.p1');
        const p2Score = document.querySelector('.score.p2');

        p1Score.textContent = 0;
        p2Score.textContent = 0;
    }

    return { updateName, updateBoxSymbol, restartGameBoard, resetScore }
})();

const gameManager = (function() {
    const restartButton = document.querySelector('.restart');
    const settingsButton = document.querySelector('.settings');
    const themeButton = document.querySelector('.theme-mode');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const form = document.querySelector('form');
    const p1 = createPlayer('Player 1', 'X');
    const p2 = createPlayer('Player 2', 'O');
    let playerTurn = 'p1';

    window.onload = () => {
        modal.classList.add('active');
    }
    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    settingsButton.addEventListener('click', () => {
        modal.classList.add('active');
    });
    restartButton.addEventListener('click', () => {
        resetPlayerTurn();
        resetScore();
        gameBoardManager.restartGameBoard();
    });
    form.addEventListener('submit', (event) => {
        const p1Name = document.getElementById('p1-name').value;
        const p2Name = document.getElementById('p2-name').value;
        const pointsToWin = document.getElementById('win-count').value;
        const botSelect = document.getElementById('ai-enable').checked;
        const botDifficulty = document.getElementById('ai-difficulty').value;

        processFormSubmit(p1Name, p2Name, pointsToWin, botSelect, botDifficulty);
        modal.classList.remove('active');
        event.preventDefault();
    });

    const getPlayerTurn = () => playerTurn;
    const switchPlayerTurn = () => playerTurn = (playerTurn === 'p1') ? 'p2' : 'p1';
    const processFormSubmit = (p1Name, p2Name, pointsToWin, botSelect, botDifficulty) => {
        updateName('p1', p1Name);
        updateName('p2', p2Name);
    }
    const updateName = (player, name) => {
        const playerObj = (player === 'p1') ? p1 : p2;

        if (name !== '') {
            playerObj.changeName(name);
            displayController.updateName(player, name);
        }
    }
    const resetScore = () => {
        p1.resetScore();
        p2.resetScore();
        displayController.resetScore();
    }
    const resetPlayerTurn = () => playerTurn = 'p1';

    return { getPlayerTurn, switchPlayerTurn }
})();

const gameBoardManager = (function() {
    const gameBoardBoxes = document.querySelectorAll('.grid-boxes');

    gameBoardBoxes.forEach((box) => {
        box.addEventListener('click', () => {
            const playerTurnSymbol = (gameManager.getPlayerTurn() === 'p1') ? 'X' : 'O';
            
            processBoxInput(box.getAttribute('data-pos'), playerTurnSymbol);
        });
    });

    const processBoxInput = (boxPositionNumber, symbol) => {
        if (gameBoard.checkBoxAvailable(boxPositionNumber)) {
            gameBoard.changeBoxSymbol(boxPositionNumber, symbol);
            displayController.updateBoxSymbol(boxPositionNumber, symbol);
            gameManager.switchPlayerTurn();
        }
    }
    const restartGameBoard = () => {
        gameBoard.restartGameBoard();
        displayController.restartGameBoard();
    }

    return { restartGameBoard }
})();

const gameBoard = (function() {
    let gameBoardBoxes = [];

    for (let i = 0; i < 9; i++) {
        gameBoardBoxes.push(createTicTacToeBox(i));
    }

    const getBox = (boxPositionNumber) => {
        const intBoxPositionNumber = parseInt(boxPositionNumber);

        return gameBoardBoxes.find((box) => {
            return intBoxPositionNumber === box.getPositionNumber();
        });
    }
    const changeBoxSymbol = (boxPositionNumber, newSymbol) => {
        const box = getBox(boxPositionNumber);

        box.changeSymbol(newSymbol);
    }
    const getBoxSymbol = (boxPositionNumber) => gameBoardBoxes[boxPositionNumber].getSymbol();
    const checkBoxAvailable = (boxPositionNumber) => getBoxSymbol(boxPositionNumber) === null;
    const checkRowWin = () => {
        const boxesPerRow = Math.sqrt(gameBoardBoxes.length);
        let winningSymbol;
        let winningIndexes = [];
        let countRowsLeft = boxesPerRow;
        let currentRowFirstIndex = 0;
 
        while (countRowsLeft > 0) {
            let symbolsMatched = 0;

            winningIndexes.push(currentRowFirstIndex);

            for (let i = currentRowFirstIndex; i < (boxesPerRow + currentRowFirstIndex - 1); i++) {
                if (gameBoardBoxes[i].getSymbol() === null || gameBoardBoxes[i + 1].getSymbol() === null) {
                    currentRowFirstIndex += boxesPerRow;
                    break;
                }
                else if (gameBoardBoxes[i].getSymbol() !== gameBoardBoxes[i + 1].getSymbol()) {
                    currentRowFirstIndex += boxesPerRow;
                    break;
                } else {
                    winningIndexes.push(i + 1);
                    symbolsMatched++;
                }
            }
            if (symbolsMatched === (boxesPerRow - 1)) {
                winningSymbol = gameBoardBoxes[currentRowFirstIndex].getSymbol();
                return { winningSymbol, winningIndexes }
            }
            winningIndexes = [];
            countRowsLeft--;
        }
        return false;
    }
    const checkColumnWin = () => {
        const boxesPerColumn = Math.sqrt(gameBoardBoxes.length);
        let winningIndexes = [];
        let winningSymbol;
        let countColumnsLeft = boxesPerColumn;
        let currentColumnFirstIndex = 0;
 
        while (countColumnsLeft > 0) {
            let symbolsMatched = 0;

            winningIndexes.push(currentColumnFirstIndex);

            for (let i = currentColumnFirstIndex; i < (boxesPerColumn * (boxesPerColumn - 1) + currentColumnFirstIndex); i += boxesPerColumn) {
                if (gameBoardBoxes[i].getSymbol() === null || gameBoardBoxes[i + boxesPerColumn].getSymbol() === null) {
                    currentColumnFirstIndex++;
                    break;
                }
                else if (gameBoardBoxes[i].getSymbol() !== gameBoardBoxes[i + boxesPerColumn].getSymbol()) {
                    currentColumnFirstIndex++;
                    break;
                } else {
                    winningIndexes.push(i + boxesPerColumn);
                    symbolsMatched++;
                }
            }
            if (symbolsMatched === (boxesPerColumn - 1)) {
                winningSymbol = gameBoardBoxes[currentColumnFirstIndex].getSymbol();
                return { winningSymbol, winningIndexes }
            }
            winningIndexes = [];
            countColumnsLeft--;
        }
        return false;
    }
    const checkDiagWin = () => {
        if (gameBoardBoxes[0].getSymbol() !== null && gameBoardBoxes[4].getSymbol() !== null && gameBoardBoxes[8].getSymbol() !== null) {
            if (gameBoardBoxes[0].getSymbol() === gameBoardBoxes[4].getSymbol() && gameBoardBoxes[4].getSymbol() === gameBoardBoxes[8].getSymbol()) {
                const winningSymbol = gameBoardBoxes[0].getSymbol();
                const winningIndexes = [0,4,8];
                return { winningSymbol, winningIndexes }
            }
        } else if (gameBoardBoxes[2].getSymbol() !== null && gameBoardBoxes[4].getSymbol() !== null && gameBoardBoxes[6].getSymbol() !== null) {
            if (gameBoardBoxes[2].getSymbol() === gameBoardBoxes[4].getSymbol() && gameBoardBoxes[4].getSymbol() === gameBoardBoxes[6].getSymbol()) {
                const winningSymbol = gameBoardBoxes[2].getSymbol();
                const winningIndexes = [2,4,6];
                return { winningSymbol, winningIndexes }
            }
        } else {
            return false;
        }
    }
    const checkWin = () => {
        const rowWin = checkRowWin();
        const colWin = checkColumnWin();
        const diagWin = checkDiagWin();
        return { rowWin, colWin, diagWin };
    }
    const restartGameBoard = () => {
        gameBoardBoxes.forEach((box) => {
            box.changeSymbol(null);
        });
    }

    return { checkBoxAvailable, changeBoxSymbol, getBoxSymbol, checkWin, restartGameBoard } 
})();

function createPlayer(name, symbol) {
    let score = 0;

    const getName = () => name;
    const getSymbol = () => symbol;
    const getScore = () => score;
    const changeName = (newName) => name = newName;
    const changeSymbol = (newSymbol) => symbol = newSymbol;
    const addScore = () => score++;
    const resetScore = () => score = 0;

    return { getName, getSymbol, getScore, changeName, changeSymbol, addScore, resetScore }
}

function createTicTacToeBox(positionNumber) {
    let symbol = null;

    const getPositionNumber = () => positionNumber;
    const changeSymbol = (newSymbol) => {
        symbol = newSymbol;
    }
    const getSymbol = () => symbol;

    return { getPositionNumber, changeSymbol, getSymbol }
}




const displayController = (function() {
    const resetScoreButton = document.querySelector('.reset-score');
    const settingsButton = document.querySelector('.settings');
    const themeButton = document.querySelector('.theme-mode');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.overlay');
    const form = document.querySelector('form');

    window.onload = () => {
        modal.classList.add('active');
    }
    overlay.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    settingsButton.addEventListener('click', () => {
        modal.classList.add('active');
    });
    form.addEventListener('submit', () => {
        const p1Name = document.getElementById('p1-name').value;
        const p2Name = document.getElementById('p2-name').value;
        const pointsToWin = document.getElementById('win-count').value;
        const botSelect = document.getElementById('ai-enable').checked;
        const botDifficulty = document.getElementById('ai-difficulty').value;

        processFormSubmit(p1Name, p2Name, pointsToWin, botSelect, botDifficulty);
        modal.classList.remove('active');
    });
    const processFormSubmit = (p1Name, p2Name, pointsToWin, botSelect, botDifficulty) => {
        updateName('p1', p1Name);
        updateName('p2', p2Name);
    }
    const updateName = (player, name) => {
        if (name !== '') {
            const playerElement = document.querySelector(`${player}-name`);

            playerElement.textContent = name;
        }
    }
})();

const gameManager = (function() {
    const createGamers = (p1Name, p1Symbol, p2Name, p2Symbol) => {
        const p1 = createPlayer(p1Name, p1Symbol);
        const p2 = createPlayer(p2Name, p2Symbol);

        return { p1, p2 }
    }
})();

const gameBoard = (function() {
    let gameBoardBoxes = [];

    for (let i = 0; i < 9; i++) {
        gameBoardBoxes.push(createTicTacToeBox(i));
    }

    const getBox = (boxPositionNumber) => {
        return gameBoardBoxes.find(({ positionNumber }) => {
            return boxPositionNumber === positionNumber;
        });
    }
    const changeBoxSymbol = (boxPositionNumber, newSymbol) => {
        const box = getBox(boxPositionNumber);

        box.changeSymbol(newSymbol);
    }
    const getBoxSymbol = (boxPositionNumber) => gameBoardBoxes[boxPositionNumber].getSymbol();
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

    const getGameBoard = () => gameBoardBoxes;

    return { changeBoxSymbol, getBoxSymbol, getGameBoard, checkWin } 
})();

function createPlayer(name, symbol) {
    let wins = 0;

    const getName = () => name;
    const getSymbol = () => symbol;
    const getWins = () => wins;
    const changeName = (newName) => name = newName;
    const changeSymbol = (newSymbol) => symbol = newSymbol;
    const addWin = () => wins++;

    return { getName, getSymbol, getWins, changeName, changeSymbol, addWin }
}

function createTicTacToeBox(positionNumber) {
    let symbol = null;

    const getPositionNumber = () => positionNumber;
    const changeSymbol = (newSymbol) => {
        symbol = newSymbol;
    }
    const getSymbol = () => symbol;

    return { getPositionNumber, changeSymbol, getSymbol }
};




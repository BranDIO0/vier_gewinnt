/**
 * Vier Gewinnt - Spiellogik (Plain JavaScript ES6+)
 * Autor: Jan Ehrler (jaehit00)
 */

// ============================================================================
// 1. Konstanten & Spielzustand (State)
// ============================================================================
const ROWS = 6;
const COLS = 7;
const STORAGE_KEY = "vierGewinnt_history";

// 2D-Array für das Spielfeld (6 Reihen x 7 Spalten): 0 = leer, 1 = Spieler 1, 2 = Spieler 2
let board = [];
let currentPlayer = 1;
let gameActive = false;
let isProcessingMove = false; // Schutz vor schnellen Doppelklicks & während Bot-Zug
let isBotEnabled = false;     // Gibt an, ob Spieler 2 vom Computer gesteuert wird

const playerNames = {
    1: "Spieler 1",
    2: "Spieler 2"
};

// ============================================================================
// 2. DOM-Elemente referenzieren
// ============================================================================
const boardElement = document.getElementById("board");
const player1Input = document.getElementById("player1-name");
const player2Input = document.getElementById("player2-name");
const player1ColorInput = document.getElementById("player1-color");
const player2ColorInput = document.getElementById("player2-color");
const botCheckbox = document.getElementById("bot-checkbox");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const statusMessage = document.getElementById("status-message");
const statsSummary = document.getElementById("stats-summary");
const historyList = document.getElementById("history-list");
const clearStatsBtn = document.getElementById("clear-stats-btn");

// ============================================================================
// 3. Spielfeld-Initialisierung & Darstellung
// ============================================================================

/**
 * Erstellt ein leeres 6x7 2D-Array (alle Werte = 0)
 * und generiert die 42 Zellen im HTML-DOM.
 */
function initBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    boardElement.innerHTML = "";

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            boardElement.appendChild(cell);
        }
    }
}

/**
 * Hilfsfunktion zur Aktualisierung der Statusanzeige.
 * @param {string} text - Anzuzeigende Nachricht
 * @param {string} type - Optional: "error" oder "win" für farbliche Hervorhebung
 */
function updateStatus(text, type = "") {
    statusMessage.textContent = text;
    statusMessage.classList.remove("error", "win");
    if (type) {
        statusMessage.classList.add(type);
    }
}

/**
 * Überträgt die gewählten Farben aus den <input type="color">-Elementen
 * in die CSS Custom Properties (--player1-color und --player2-color).
 */
function applyPlayerColors() {
    document.documentElement.style.setProperty("--player1-color", player1ColorInput.value);
    document.documentElement.style.setProperty("--player2-color", player2ColorInput.value);
}

// ============================================================================
// 4. Spielstart, Validierung & Neustart
// ============================================================================

/**
 * Wenn die Bot-Checkbox umgeschaltet wird, setzen wir automatisch den Namen für Spieler 2.
 */
function handleBotToggle() {
    if (botCheckbox.checked) {
        player2Input.value = "Computer (Bot)";
        player2Input.disabled = true;
    } else {
        if (player2Input.value === "Computer (Bot)") {
            player2Input.value = "";
        }
        player2Input.disabled = false;
    }
}

/**
 * Prüft die eingegebenen Spielernamen sowie Farben und startet das Spiel.
 */
function startGame() {
    const name1 = player1Input.value.trim();
    const name2 = player2Input.value.trim();
    const color1 = player1ColorInput.value.toLowerCase();
    const color2 = player2ColorInput.value.toLowerCase();

    // 1. Fehlbedienung abfangen: Leere Namen verhindern
    if (name1 === "" || name2 === "") {
        updateStatus("Fehler: Bitte gebt für beide Spieler einen Namen ein!", "error");
        return;
    }

    // 2. Fehlbedienung abfangen: Identische Namen verhindern
    if (name1.toLowerCase() === name2.toLowerCase()) {
        updateStatus("Fehler: Beide Spieler dürfen nicht denselben Namen haben!", "error");
        return;
    }

    // 3. Fehlbedienung abfangen: Identische Steinfarben verhindern
    if (color1 === color2) {
        updateStatus("Fehler: Bitte wählt zwei unterschiedliche Farben für die Spielsteine!", "error");
        return;
    }

    // Gültige Einstellungen übernehmen
    playerNames[1] = name1;
    playerNames[2] = name2;
    isBotEnabled = botCheckbox.checked;
    applyPlayerColors();

    // Spielzustand zurücksetzen und aktivieren
    initBoard();
    currentPlayer = 1;
    gameActive = true;
    isProcessingMove = false;

    // UI-Elemente für laufendes Spiel sperren/aktivieren
    boardElement.classList.add("active");
    player1Input.disabled = true;
    player2Input.disabled = true;
    player1ColorInput.disabled = true;
    player2ColorInput.disabled = true;
    botCheckbox.disabled = true;
    startBtn.disabled = true;
    restartBtn.disabled = false;

    updateStatus(`${playerNames[currentPlayer]} ist am Zug.`);
}

/**
 * Setzt das laufende Spiel komplett zurück, ohne die Seite neu zu laden.
 */
function restartGame() {
    initBoard();
    currentPlayer = 1;
    gameActive = false;
    isProcessingMove = false;

    // Eingabefelder wieder freigeben
    boardElement.classList.remove("active");
    player1Input.disabled = false;
    player2Input.disabled = botCheckbox.checked;
    player1ColorInput.disabled = false;
    player2ColorInput.disabled = false;
    botCheckbox.disabled = false;
    startBtn.disabled = false;
    restartBtn.disabled = true;

    updateStatus("Spiel zurückgesetzt. Klickt auf „Spiel starten“ für eine neue Runde.");
}

// ============================================================================
// 5. Spielzug-Logik & Schutz vor Fehlbedienungen
// ============================================================================

/**
 * Sucht in einer Spalte von unten nach oben (Reihe 5 bis 0) die erste freie Zelle.
 * @param {number} col - Index der geklickten Spalte (0 bis 6)
 * @returns {number} Reihen-Index (0 bis 5) oder -1, falls die Spalte voll ist
 */
function getLowestEmptyRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
            return row;
        }
    }
    return -1;
}

/**
 * Verarbeitet einen Klick auf das Spielfeld (Event Delegation).
 * @param {MouseEvent} event - Das Klick-Event
 */
function handleBoardClick(event) {
    // 1. Fehlbedienung abfangen: Spiel inaktiv oder Zug wird gerade verarbeitet (Doppelklick/Bot)
    if (!gameActive || isProcessingMove) {
        return;
    }

    const clickedCell = event.target.closest(".cell");
    if (!clickedCell) {
        return;
    }

    const col = Number(clickedCell.dataset.col);
    executeMove(col);
}

/**
 * Führt einen Spielzug in der angegebenen Spalte aus (für Mensch und Bot).
 * @param {number} col - Spalten-Index (0 bis 6)
 */
function executeMove(col) {
    isProcessingMove = true;

    const targetRow = getLowestEmptyRow(col);

    // Fehlbedienung abfangen: Geklickte Spalte ist bereits voll
    if (targetRow === -1) {
        updateStatus(
            `Diese Spalte ist bereits voll! ${playerNames[currentPlayer]} ist weiterhin am Zug.`,
            "error"
        );
        isProcessingMove = false;
        return;
    }

    // Stein im 2D-Array speichern und im DOM darstellen
    board[targetRow][col] = currentPlayer;
    const targetCell = boardElement.querySelector(
        `.cell[data-row="${targetRow}"][data-col="${col}"]`
    );
    targetCell.classList.add(`player${currentPlayer}`);

    // Gewinnprüfung nach dem gesetzten Stein
    const winningCells = checkWin(targetRow, col, currentPlayer);
    if (winningCells) {
        gameActive = false;
        boardElement.classList.remove("active");
        highlightWinningCells(winningCells);
        updateStatus(`🎉 ${playerNames[currentPlayer]} hat gewonnen!`, "win");
        saveGameResult(playerNames[currentPlayer]);
        isProcessingMove = false;
        return;
    }

    // Unentschieden-Prüfung (Spielfeld komplett voll)
    if (checkDraw()) {
        gameActive = false;
        boardElement.classList.remove("active");
        updateStatus("Unentschieden! Das Spielfeld ist komplett voll.", "win");
        saveGameResult("Unentschieden");
        isProcessingMove = false;
        return;
    }

    // Spielerwechsel
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateStatus(`${playerNames[currentPlayer]} ist am Zug.`);

    // Falls der Computergegner (Bot) aktiv und jetzt am Zug ist:
    if (isBotEnabled && currentPlayer === 2) {
        setTimeout(() => {
            makeBotMove();
        }, 450);
    } else {
        // Kurze Entprell-Sperre (150 ms) gegen versehentliche Doppelklicks
        setTimeout(() => {
            isProcessingMove = false;
        }, 150);
    }
}

// ============================================================================
// 6. Gewinn- und Unentschieden-Prüfung
// ============================================================================

/**
 * Prüft ausgehend vom zuletzt gesetzten Stein (row, col), ob mindestens
 * 4 Steine desselben Spielers in einer Reihe liegen.
 */
function checkWin(row, col, player) {
    const directions = [
        [0, 1],  // Horizontal (links <-> rechts)
        [1, 0],  // Vertikal (oben <-> unten)
        [1, 1],  // Diagonal fallend (\)
        [1, -1]  // Diagonal steigend (/)
    ];

    for (const [dRow, dCol] of directions) {
        const connectedCells = [{ row, col }];

        collectCellsInDirection(row, col, dRow, dCol, player, connectedCells);
        collectCellsInDirection(row, col, -dRow, -dCol, player, connectedCells);

        if (connectedCells.length >= 4) {
            return connectedCells;
        }
    }

    return null;
}

/**
 * Sammelt entlang einer Richtung (stepRow, stepCol) alle angrenzenden Steine desselben Spielers.
 */
function collectCellsInDirection(startRow, startCol, stepRow, stepCol, player, connectedCells) {
    let r = startRow + stepRow;
    let c = startCol + stepCol;

    while (
        r >= 0 && r < ROWS &&
        c >= 0 && c < COLS &&
        board[r][c] === player
    ) {
        connectedCells.push({ row: r, col: c });
        r += stepRow;
        c += stepCol;
    }
}

/**
 * Hebt die Steine der Gewinner-Kombination optisch im DOM hervor.
 */
function highlightWinningCells(cells) {
    for (const { row, col } of cells) {
        const cellElement = boardElement.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        if (cellElement) {
            cellElement.classList.add("winning-cell");
        }
    }
}

/**
 * Prüft auf Unentschieden (oberste Reihe komplett belegt).
 */
function checkDraw() {
    return board[0].every((cellValue) => cellValue !== 0);
}

// ============================================================================
// 7. Optionale Erweiterung: Einfacher Computergegner (Bot)
// ============================================================================

/**
 * Entscheidet und führt den Zug des Computergegners (Spieler 2) aus:
 * 1. Kann der Bot mit einem Zug direkt gewinnen? -> Diesen Zug wählen.
 * 2. Kann Spieler 1 im nächsten Zug gewinnen? -> Diese Spalte blockieren.
 * 3. Sonst: Zufällige noch freie Spalte wählen.
 */
function makeBotMove() {
    if (!gameActive) {
        return;
    }

    // Alle Spalten sammeln, die noch mindestens ein freies Feld haben
    const validCols = [];
    for (let col = 0; col < COLS; col++) {
        if (getLowestEmptyRow(col) !== -1) {
            validCols.push(col);
        }
    }

    if (validCols.length === 0) {
        return;
    }

    // 1. Prüfen, ob der Bot (Spieler 2) sofort gewinnen kann
    for (const col of validCols) {
        const row = getLowestEmptyRow(col);
        board[row][col] = 2; // Zug testweise setzen
        const isWinningMove = checkWin(row, col, 2) !== null;
        board[row][col] = 0; // Testzug wieder rückgängig machen
        if (isWinningMove) {
            executeMove(col);
            return;
        }
    }

    // 2. Prüfen, ob Spieler 1 im nächsten Zug gewinnen würde, und blockieren
    for (const col of validCols) {
        const row = getLowestEmptyRow(col);
        board[row][col] = 1; // Gegnerzug testweise simulieren
        const opponentWouldWin = checkWin(row, col, 1) !== null;
        board[row][col] = 0; // Testzug wieder rückgängig machen
        if (opponentWouldWin) {
            executeMove(col);
            return;
        }
    }

    // 3. Ansonsten eine zufällige freie Spalte wählen
    const randomIndex = Math.floor(Math.random() * validCols.length);
    const chosenCol = validCols[randomIndex];
    executeMove(chosenCol);
}

// ============================================================================
// 8. Optionale Erweiterung: Spielverlauf im localStorage speichern
// ============================================================================

/**
 * Liest den bisherigen Spielverlauf aus dem localStorage via JSON.parse().
 * @returns {Array<{player1: string, player2: string, winner: string, date: string}>}
 */
function loadHistory() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
        return [];
    }
    try {
        return JSON.parse(rawData);
    } catch {
        return [];
    }
}

/**
 * Speichert ein abgeschlossenes Spiel im localStorage via JSON.stringify().
 * @param {string} winner - Name des Siegers oder "Unentschieden"
 */
function saveGameResult(winner) {
    const history = loadHistory();
    const newEntry = {
        player1: playerNames[1],
        player2: playerNames[2],
        winner: winner,
        date: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    };

    // Neuestes Spiel an den Anfang der Liste setzen (maximal 10 Einträge speichern)
    history.unshift(newEntry);
    if (history.length > 10) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
}

/**
 * Stellt den gespeicherten Spielverlauf im DOM dar.
 */
function renderHistory() {
    const history = loadHistory();
    historyList.innerHTML = "";

    if (history.length === 0) {
        statsSummary.textContent = "Noch keine abgeschlossenen Spiele gespeichert.";
        return;
    }

    statsSummary.textContent = `Gespeicherte Spiele im Browser: ${history.length}`;

    for (const match of history) {
        const li = document.createElement("li");
        const resultText = match.winner === "Unentschieden"
            ? "Unentschieden"
            : `Sieger: ${match.winner}`;
        li.textContent = `[${match.date} Uhr] ${match.player1} vs. ${match.player2} — ${resultText}`;
        historyList.appendChild(li);
    }
}

/**
 * Löscht den gespeicherten Verlauf aus dem localStorage.
 */
function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    renderHistory();
}

// ============================================================================
// 9. Event-Listener & Programmstart
// ============================================================================
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
boardElement.addEventListener("click", handleBoardClick);
player1ColorInput.addEventListener("input", applyPlayerColors);
player2ColorInput.addEventListener("input", applyPlayerColors);
botCheckbox.addEventListener("change", handleBotToggle);
clearStatsBtn.addEventListener("click", clearHistory);

// Beim ersten Laden der Seite: Spielfeld aufbauen, Farben setzen und Historie laden
initBoard();
applyPlayerColors();
renderHistory();

/**
 * Vier Gewinnt - Spiellogik (Plain JavaScript ES6+)
 * Autor: Jan Ehrler (jaehit00)
 */

// ============================================================================
// 1. Konstanten & Spielzustand (State)
// ============================================================================
const ROWS = 6;
const COLS = 7;

// 2D-Array für das Spielfeld (6 Reihen x 7 Spalten): 0 = leer, 1 = Spieler 1, 2 = Spieler 2
let board = [];
let currentPlayer = 1;
let gameActive = false;
let isProcessingMove = false; // Schutz vor schnellen Doppelklicks (für Schritt 4)

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
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const statusMessage = document.getElementById("status-message");

// ============================================================================
// 3. Spielfeld-Initialisierung & Darstellung
// ============================================================================

/**
 * Erstellt ein leeres 6x7 2D-Array (alle Werte = 0)
 * und generiert die 42 Zellen im HTML-DOM.
 */
function initBoard() {
    // 2D-Array mit Nullen füllen
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

    // DOM-Container leeren
    boardElement.innerHTML = "";

    // 6 Reihen x 7 Spalten als div-Elemente erzeugen
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            // Koordinaten als data-Attribute speichern für einfachen Zugriff
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

// ============================================================================
// 4. Spielstart, Validierung & Neustart
// ============================================================================

/**
 * Prüft die eingegebenen Spielernamen und startet das Spiel bei gültiger Eingabe.
 */
function startGame() {
    const name1 = player1Input.value.trim();
    const name2 = player2Input.value.trim();

    // Fehlbedienung abfangen: Leere Namen verhindern
    if (name1 === "" || name2 === "") {
        updateStatus("Fehler: Bitte gebt für beide Spieler einen Namen ein!", "error");
        return;
    }

    // Fehlbedienung abfangen: Identische Namen verhindern (Groß-/Kleinschreibung ignoriert)
    if (name1.toLowerCase() === name2.toLowerCase()) {
        updateStatus("Fehler: Beide Spieler dürfen nicht denselben Namen haben!", "error");
        return;
    }

    // Gültige Namen übernehmen
    playerNames[1] = name1;
    playerNames[2] = name2;

    // Spielzustand zurücksetzen und aktivieren
    initBoard();
    currentPlayer = 1;
    gameActive = true;
    isProcessingMove = false;

    // UI-Elemente für laufendes Spiel anpassen
    boardElement.classList.add("active");
    player1Input.disabled = true;
    player2Input.disabled = true;
    startBtn.disabled = true;
    restartBtn.disabled = false;

    updateStatus(`${playerNames[currentPlayer]} (Rot) ist am Zug.`);
}

/**
 * Setzt das laufende Spiel komplett zurück, ohne die Seite neu zu laden.
 */
function restartGame() {
    initBoard();
    currentPlayer = 1;
    gameActive = false;
    isProcessingMove = false;

    // Eingabefelder wieder freigeben, damit Namen bei Bedarf geändert werden können
    boardElement.classList.remove("active");
    player1Input.disabled = false;
    player2Input.disabled = false;
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
    // 1. Fehlbedienung abfangen: Spiel noch nicht gestartet oder bereits beendet
    if (!gameActive) {
        return;
    }

    // 2. Fehlbedienung abfangen: Schutz gegen schnelle Doppelklicks
    if (isProcessingMove) {
        return;
    }

    // Prüfen, ob tatsächlich auf eine einzelne Zelle (.cell) geklickt wurde
    const clickedCell = event.target.closest(".cell");
    if (!clickedCell) {
        return;
    }

    // Zug-Verarbeitung sperren, bis der aktuelle Zug komplett abgeschlossen ist
    isProcessingMove = true;

    const col = Number(clickedCell.dataset.col);
    const targetRow = getLowestEmptyRow(col);

    // 3. Fehlbedienung abfangen: Geklickte Spalte ist bereits voll
    if (targetRow === -1) {
        const colorName = currentPlayer === 1 ? "Rot" : "Gelb";
        updateStatus(
            `Diese Spalte ist bereits voll! ${playerNames[currentPlayer]} (${colorName}) ist weiterhin am Zug.`,
            "error"
        );
        isProcessingMove = false;
        return;
    }

    // Stein im 2D-Array (Datenmodell) speichern
    board[targetRow][col] = currentPlayer;

    // Zugehörige Zelle im DOM suchen und farblich markieren
    const targetCell = boardElement.querySelector(
        `.cell[data-row="${targetRow}"][data-col="${col}"]`
    );
    targetCell.classList.add(`player${currentPlayer}`);

    // 4. Gewinnprüfung nach dem gesetzten Stein
    const winningCells = checkWin(targetRow, col, currentPlayer);
    if (winningCells) {
        gameActive = false;
        boardElement.classList.remove("active");
        highlightWinningCells(winningCells);
        const colorName = currentPlayer === 1 ? "Rot" : "Gelb";
        updateStatus(`🎉 ${playerNames[currentPlayer]} (${colorName}) hat gewonnen!`, "win");
        isProcessingMove = false;
        return;
    }

    // 5. Unentschieden-Prüfung (Spielfeld komplett voll)
    if (checkDraw()) {
        gameActive = false;
        boardElement.classList.remove("active");
        updateStatus("Unentschieden! Das Spielfeld ist komplett voll.", "win");
        isProcessingMove = false;
        return;
    }

    // Spielerwechsel vorbereiten
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    const nextColorName = currentPlayer === 1 ? "Rot" : "Gelb";
    updateStatus(`${playerNames[currentPlayer]} (${nextColorName}) ist am Zug.`);

    // Kurze Entprell-Sperre (150 ms) gegen versehentliche Doppelklicks
    setTimeout(() => {
        isProcessingMove = false;
    }, 150);
}

// ============================================================================
// 6. Gewinn- und Unentschieden-Prüfung
// ============================================================================

/**
 * Prüft ausgehend vom zuletzt gesetzten Stein (row, col), ob mindestens
 * 4 Steine desselben Spielers in einer Reihe liegen (horizontal, vertikal, diagonal).
 *
 * @param {number} row - Reihe des zuletzt gesetzten Steins
 * @param {number} col - Spalte des zuletzt gesetzten Steins
 * @param {number} player - Aktueller Spieler (1 oder 2)
 * @returns {Array<{row: number, col: number}> | null} Array der Gewinnzellen oder null
 */
function checkWin(row, col, player) {
    // Die 4 zu prüfenden Achsen als Richtungsvektoren [dRow, dCol]
    const directions = [
        [0, 1],  // Horizontal (links <-> rechts)
        [1, 0],  // Vertikal (oben <-> unten)
        [1, 1],  // Diagonal fallend (\)
        [1, -1]  // Diagonal steigend (/)
    ];

    for (const [dRow, dCol] of directions) {
        // Startet mit dem soeben gesetzten Stein
        const connectedCells = [{ row, col }];

        // In positive Richtung entlang der Achse zählen (+dRow, +dCol)
        collectCellsInDirection(row, col, dRow, dCol, player, connectedCells);

        // In entgegengesetzte Richtung entlang der Achse zählen (-dRow, -dCol)
        collectCellsInDirection(row, col, -dRow, -dCol, player, connectedCells);

        // Sobald 4 (oder mehr) zusammenhängende Steine gefunden wurden -> Sieg!
        if (connectedCells.length >= 4) {
            return connectedCells;
        }
    }

    return null;
}

/**
 * Läuft vom Startpunkt (startRow, startCol) Schritt für Schritt in Richtung (stepRow, stepCol)
 * und sammelt alle direkt angrenzenden Steine desselben Spielers.
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
 * @param {Array<{row: number, col: number}>} cells - Koordinaten der Gewinnsteine
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
 * Prüft auf Unentschieden: Wenn in der obersten Reihe (Index 0)
 * jede Zelle ungleich 0 ist, ist das gesamte 6x7-Feld voll.
 * @returns {boolean} true bei Unentschieden, sonst false
 */
function checkDraw() {
    return board[0].every((cellValue) => cellValue !== 0);
}

// ============================================================================
// 7. Event-Listener & Programmstart
// ============================================================================
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);
boardElement.addEventListener("click", handleBoardClick);

// Beim ersten Laden der Seite das leere 7x6-Spielfeld aufbauen
initBoard();

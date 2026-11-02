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
// 5. Event-Listener & Programmstart
// ============================================================================
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

// Beim ersten Laden der Seite das leere 7x6-Spielfeld aufbauen
initBoard();

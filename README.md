# Vier Gewinnt – Laboraufgabe Internettechnologien (Lab 1)

**Autor:** Jan Ehrler (`jaehit00`)  
**Studiengang:** Softwaretechnik und Medieninformatik – Hochschule Esslingen

---

## Projektbeschreibung

Diese Webanwendung implementiert das klassische Strategiespiel **„Vier Gewinnt“** für zwei lokale Spieler (oder gegen einen integrierten Computergegner) direkt im Browser. Das Projekt wurde ausschließlich mit **HTML5**, **CSS3** und **Plain JavaScript (ES6+)** ohne externe Frameworks, Bibliotheken oder Build-Tools umgesetzt.

### Hauptfunktionen
- **Semantisches HTML5 & Responsive Design:** Übersichtliches Layout mit Header, Steuerungsbereich, 7×6-Spielfeld (CSS Grid) und Ergebnisverlauf – optimal bedienbar auf Desktop- und Smartphone-Bildschirmen.
- **Vollständige Spiellogik:** 2D-Array-Repräsentation (`6 Reihen × 7 Spalten`), Schwerkraft-Logik beim Einwerfen der Spielsteine sowie automatische Gewinnprüfung in alle vier Richtungen (horizontal, vertikal, beide Diagonalen) und Unentschieden-Erkennung.
- **Schutz vor Fehlbedienungen:**
  - Validierung der Spielernamen (keine leeren oder identischen Namen erlaubt) und Steinfarben.
  - Ignorieren von Klicks in volle Spalten oder außerhalb eines aktiven Spiels.
  - Entprell-Sperre (`isProcessingMove`) gegen versehentliche Doppelklicks.
  - Vollständiger Spiel-Neustart im DOM ohne Neuladen der Seite (`location.reload()` wird nicht verwendet).
- **Optionale Erweiterungen & Zusatzfeatures:**
  - **Individuelle Farbwahl:** Auswahl der Spielsteinfarben über `<input type="color">` und dynamische Übergabe an CSS Custom Properties.
  - **Computergegner (Bot):** Zuschaltbarer Bot, der eigene Gewinnzüge erkennt, direkte Gewinnzüge des Gegners blockiert und ansonsten zufällige gültige Spalten wählt.
  - **Persistenter Spielverlauf:** Speicherung und Anzeige der letzten abgeschlossenen Partien über `localStorage` (`JSON.stringify` / `JSON.parse`).
  - **Darkmode:** Umschaltbares helles und dunkles Farbschema (inkl. Speicherung der Präferenz im `localStorage`).

---

## Projektstruktur

- `index.html` – Semantische HTML5-Struktur der Anwendung
- `style.css` – Layout, Responsive Design, CSS Grid für das Spielfeld und Darkmode-Variablen
- `script.js` – Komplette Spiellogik, Validierung, Bot-Entscheidungslogik und `localStorage`-Anbindung
- `picture/Logo_HS_Esslingen.webp` – Logo der Hochschule Esslingen
- `KI-Statement.md` – Dokumentation zum Einsatz von KI-Werkzeugen bei der Entwicklung

---

## Ausführung

Für die Ausführung wird kein lokaler Webserver oder Build-Prozess benötigt:
1. Repository / Projektordner lokal öffnen.
2. Die Datei `index.html` direkt per Doppelklick in einem modernen Webbrowser (z. B. Chrome, Firefox, Edge) öffnen.

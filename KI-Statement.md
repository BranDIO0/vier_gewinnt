# Erklärung zum Einsatz von KI-Hilfsmitteln (KI-Statement)

**Projekt:** Laboraufgabe 1 – Vier Gewinnt  
**Name:** Jan Ehrler (`jaehit00`)  
**Studiengang:** Softwaretechnik und Medieninformatik (Hochschule Esslingen)

---

## 1. Grundsatz der Arbeitsweise

Bei der Entwicklung dieser Webanwendung wurde ein KI-Sprachmodell unterstützend als Werkzeug herangezogen. Die inhaltliche und technische Steuerung des Projekts lag dabei jederzeit bei mir:
- Die Architektur, der schrittweise Aufbau sowie sämtliche fachlichen Anforderungen wurden von mir vorgegeben, kontrolliert und nach jedem Entwicklungsschritt eigenständig getestet und nachvollzogen.
- Ich habe darauf geachtet, dass keine unnötig komplexen Konstrukte verwendet werden, sodass ich jede Funktion und jede Zeile des Quellcodes vollständig verstehe und in der Abnahme im Detail erläutern kann.

---

## 2. Abgrenzung zwischen Eigenleistung und KI-Unterstützung

### Eigenverantwortlich konzipiert 
- **HTML-Grundstruktur & Aufbau:** Die semantische Gliederung der Anwendung (`header`, `main`, `section`), die Aufteilung der Steuerelemente sowie die Einbindung der Spielfeld-Zellen.
- **Programmlogik in JavaScript (`script.js`):**
  - Datenmodell des 6×7-Spielfelds (2D-Array) und Verwaltung des Spielzustands.
  - Schwerkraft-Logik zum Ermitteln der untersten freien Reihe einer geklickten Spalte (`getLowestEmptyRow`).
  - Algorithmus zur Gewinnprüfung in alle vier Achsen (horizontal, vertikal, beide Diagonalen) ausgehend vom zuletzt gesetzten Stein (`checkWin` und `collectCellsInDirection`) sowie Unentschieden-Erkennung (`checkDraw`).
  - Abfangen sämtlicher Fehlbedienungen (Namensvalidierung, Sperren voller Spalten, Doppelklick-Schutz, Neustart ohne `location.reload()`).
  - Logik für die optionalen Erweiterungen (`localStorage`-Anbindung und Entscheidungsregeln des einfachen Computergegners).

### Unterstützung durch KI
- **CSS-Gestaltung (`style.css`):** Bei der visuellen Ausgestaltung, der Abstimmung von Abständen, Farben sowie dem responsiven Verhalten über CSS Grid/Flexbox und Media Queries hat die KI unterstützend geholfen.
- **Darkmode-Implementierung:** Das Farbschema für den Darkmode (`body.dark-mode` über CSS Custom Properties) sowie der zugehörige Umschalt-Button wurden vollständig durch die KI erstellt und anschließend von mir in das Projekt integriert und geprüft.

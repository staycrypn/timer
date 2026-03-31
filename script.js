const baseStack = ["4♣", "2♥", "7♦", "3♣", "4♥", "6♦", "A♠", "5♥", "9♠", "2♠", "Q♥", "3♦", "Q♣", "8♥", "6♠", "5♠", "9♥", "K♣", "2♦", "J♥", "3♠", "8♠", "6♥", "10♣", "5♦", "K♦", "2♣", "3♥", "8♦", "5♣", "K♠", "J♦", "8♣", "10♠", "K♥", "J♣", "7♠", "10♥", "A♦", "4♠", "7♥", "4♦", "A♣", "9♣", "J♠", "Q♦", "7♣", "Q♠", "10♦", "6♣", "A♥", "9♦"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["♣", "♥", "♦", "♠"];

let targetR = "A", targetS = "♠", bottomR = "9", bottomS = "♦";
let running = false, startTime, elapsed = 0, timerInterval, hasStopped = false;

const startBtn = document.getElementById('start-btn');
const lapBtn = document.getElementById('lap-btn');
const timerDisplay = document.getElementById('timer-display');

// CALCOLO POSIZIONE
function calculatePos() {
    try {
        const t = targetR + targetS;
        const b = bottomR + bottomS;
        const idxB = baseStack.indexOf(b);
        const rotated = [...baseStack.slice(idxB + 1), ...baseStack.slice(0, idxB + 1)];
        const pos = rotated.indexOf(t) + 1;
        document.getElementById('live-pos-code').innerText = "v. 2.0." + pos;
        return pos;
    } catch(e) { return 0; }
}

// GESTIONE PANNELLO SEGRETO
function togglePanel() { 
    document.getElementById('secret-panel').classList.toggle('open'); 
}

// AGGIORNAMENTO STATO ATTIVO BOTTONI NELLA GRIGLIA
function updateGridActive(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const targetValue = value.toString().trim().toUpperCase();
    Array.from(container.children).forEach(btn => {
        const btnText = btn.innerText.trim().toUpperCase();
        btn.classList.toggle('active', btnText === targetValue);
    });
}

// LOGICA TASTO START/STOP
startBtn.onclick = function() {
    if(!running) {
        running = true;
        startTime = Date.now() - elapsed;
        timerInterval = setInterval(updateTime, 40);
        this.innerText = "Stop"; 
        this.classList.add('stop');
        lapBtn.innerText = "Giro"; 
        lapBtn.classList.add('active');
        hasStopped = false;
    } else {
        running = false;
        clearInterval(timerInterval);
        this.innerText = "Avvia"; 
        this.classList.remove('stop');
        lapBtn.innerText = "Ripristina";
        hasStopped = true;
        
        applySmartForce();
    }
};

// LOGICA TASTO GIRO/RIPRISTINA
lapBtn.onclick = function() {
    if(!running && hasStopped) {
        elapsed = 0; 
        hasStopped = false;
        timerDisplay.innerText = "00:00,00";
        this.innerText = "Giro"; 
        this.classList.remove('active');
    }
};

function updateTime() {
    elapsed = Date.now() - startTime;
    let m = Math.floor(elapsed / 60000);
    let s = Math.floor((elapsed % 60000) / 1000);
    let c = Math.floor((elapsed % 1000) / 10);
    timerDisplay.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(c).padStart(2,'0')}`;
}

// FORZATURA ACAAN
function applySmartForce() {
    let pos = calculatePos();
    let curTotalCents = Math.floor(elapsed / 10);
    let curSec = Math.floor(elapsed / 1000);
    let candidates = [];
    
    for(let s = curSec - 1; s <= curSec + 2; s++) {
        if(s < 0) continue;
        let sStr = String(s).padStart(2,'0');
        let sumS = parseInt(sStr[0]) + parseInt(sStr[1]);
        for(let c = 0; c <= 99; c++) {
            let cStr = String(c).padStart(2,'0');
            let sumC = parseInt(cStr[0]) + parseInt(cStr[1]);
            if((sumS + sumC) === pos) candidates.push(s * 100 + c);
        }
    }
    
    if(candidates.length === 0) {
        for(let s = curSec - 1; s <= curSec + 2; s++) {
            if(s < 0) continue;
            let c = pos - s;
            if(c >= 0 && c <= 99) candidates.push(s * 100 + c);
        }
    }
    
    if(candidates.length > 0) {
        let best = candidates.reduce((prev, curr) => Math.abs(curr - curTotalCents) < Math.abs(prev - curTotalCents) ? curr : prev);
        let fs = Math.floor(best / 100);
        let fc = best % 100;
        timerDisplay.innerText = `00:${String(fs).padStart(2,'0')},${String(fc).padStart(2,'0')}`;
    }
}

// COSTRUZIONE INTERFACCIA GRIGLIE
function buildUI(containerId, list, type, isTarget) {
    const container = document.getElementById(containerId);
    list.forEach(item => {
        const b = document.createElement('button');
        b.innerText = item;
        b.onclick = (e) => {
            e.stopPropagation();
            if(type === 'ranks') {
                if(isTarget) targetR = item; else bottomR = item;
            } else {
                if(isTarget) targetS = item; else bottomS = item;
                calculatePos();
                // Chiude il pannello solo se hai selezionato il seme (ultimo step)
                if(isTarget) togglePanel();
            }
            updateGridActive(containerId, item);
        };
        container.appendChild(b);
    });
}

// INIZIALIZZAZIONE
buildUI('target-ranks', ranks, 'ranks', true);
buildUI('target-suits', suits, 'suits', true);
buildUI('bottom-ranks', ranks, 'ranks', false);
buildUI('bottom-suits', suits, 'suits', false);

updateGridActive('target-ranks', targetR);
updateGridActive('target-suits', targetS);
updateGridActive('bottom-ranks', bottomR);
updateGridActive('bottom-suits', bottomS);

calculatePos();

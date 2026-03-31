const baseStack = ["4♣", "2♥", "7♦", "3♣", "4♥", "6♦", "A♠", "5♥", "9♠", "2♠", "Q♥", "3♦", "Q♣", "8♥", "6♠", "5♠", "9♥", "K♣", "2♦", "J♥", "3♠", "8♠", "6♥", "10♣", "5♦", "K♦", "2♣", "3♥", "8♦", "5♣", "K♠", "J♦", "8♣", "10♠", "K♥", "J♣", "7♠", "10♥", "A♦", "4♠", "7♥", "4♦", "A♣", "9♣", "J♠", "Q♦", "7♣", "Q♠", "10♦", "6♣", "A♥", "9♦"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["♥", "♦", "♣", "♠"]; // 1=Cuori, 2=Quadri, 3=Fiori, 4=Picche

let tRIdx = 0; // Target Valore (Asso = 0)
let tSIdx = 0; // Target Seme (Cuori = 0)
let bRIdx = 8; // Fondo Valore (9 = 8)
let bSIdx = 1; // Fondo Seme (Quadri = 1)

let running = false, startTime, elapsed = 0, timerInterval, hasStopped = false;

const startBtn = document.getElementById('start-btn');
const lapBtn = document.getElementById('lap-btn');
const timerDisplay = document.getElementById('timer-display');
const infoDisplay = document.getElementById('live-pos-code');

function updateDisplayInfo() {
    const targetR = ranks[tRIdx];
    const targetS = suits[tSIdx];
    const bottomR = ranks[bRIdx];
    const bottomS = suits[bSIdx];
    
    const t = targetR + targetS;
    const b = bottomR + bottomS;
    
    const idxB = baseStack.indexOf(b);
    const rotated = [...baseStack.slice(idxB + 1), ...baseStack.slice(0, idxB + 1)];
    const pos = rotated.indexOf(t) + 1;

    // Visualizza Valore.Seme.Posizione
    infoDisplay.innerText = `${tRIdx + 1}.${tSIdx + 1}.${pos}`;
    return pos;
}

// TOCCO SUL TIMER: Cambia sempre il SEME (1-4)
timerDisplay.onclick = function() {
    tSIdx = (tSIdx + 1) % 4;
    updateDisplayInfo();
};

// TASTO GIRO: Cambia sempre il VALORE (1-13)
lapBtn.onclick = function() {
    if (hasStopped) {
        // Se il timer è stato fermato, il tasto resetta tutto
        elapsed = 0;
        hasStopped = false;
        timerDisplay.innerText = "00:00,00";
        this.innerText = "Giro";
        this.classList.remove('active');
        // Opzionale: resetta anche la carta target ad Asso di Cuori
        tRIdx = 0; tSIdx = 0;
    } else {
        // Aumenta il valore della carta target (sia da fermo che in corsa)
        tRIdx = (tRIdx + 1) % 13;
    }
    updateDisplayInfo();
};

startBtn.onclick = function() {
    if(!running) {
        running = true;
        startTime = Date.now() - elapsed;
        timerInterval = setInterval(updateTime, 40);
        this.innerText = "Stop"; this.classList.add('stop');
        lapBtn.classList.add('active');
        hasStopped = false;
    } else {
        running = false;
        clearInterval(timerInterval);
        this.innerText = "Avvia"; this.classList.remove('stop');
        lapBtn.innerText = "Ripristina";
        hasStopped = true;
        applySmartForce();
    }
};

function updateTime() {
    elapsed = Date.now() - startTime;
    let m = Math.floor(elapsed / 60000);
    let s = Math.floor((elapsed % 60000) / 1000);
    let c = Math.floor((elapsed % 1000) / 10);
    timerDisplay.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(c).padStart(2,'0')}`;
}

function applySmartForce() {
    const pos = updateDisplayInfo(); // Prende la posizione finale basata sulla carta selezionata
    let curTotalCents = Math.floor(elapsed / 10);
    let curSec = Math.floor(elapsed / 1000);
    let candidates = [];
    
    // Cerca un tempo dove la somma delle cifre faccia la POSIZIONE
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
    
    // Se non trova la somma perfetta, usa il metodo fallback (secondi + centesimi = posizione)
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

updateDisplayInfo();

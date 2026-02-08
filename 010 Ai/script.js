class Jugador {
    constructor() {
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.size = 60;
        this.rangoAtaque = 150;
        this.speed = 7;
        this.lvl = 1;
        this.xp = 0;
        this.nextLvlXp = 100;
        this.xpMultiplier = 1;
    }

    gainXp(amount) {
        this.xp += amount * this.xpMultiplier;
        if (this.xp >= this.nextLvlXp) this.levelUp();
        this.updateUI();
    }

    levelUp() {
        this.lvl++;
        this.xp = 0;
        this.nextLvlXp = Math.floor(this.nextLvlXp * 1.5);
        showUpgradeMenu();
    }

    updateUI() {
        const xpPercent = (this.xp / this.nextLvlXp) * 100;
        document.querySelector("#xp-bar").style.width = xpPercent + "%";
        document.querySelector("#lvl-display").innerText = this.lvl;
    }
}

class Npc {
    constructor(w, h) {
        const side = Math.floor(Math.random() * 4);
        if(side === 0) { this.x = -50; this.y = Math.random() * h; }
        else if(side === 1) { this.x = w + 50; this.y = Math.random() * h; }
        else if(side === 2) { this.x = Math.random() * w; this.y = -50; }
        else { this.x = Math.random() * w; this.y = h + 50; }
        this.size = 40;
    }
    mueve() {
        this.x += (Math.random() - 0.5) * 6;
        this.y += (Math.random() - 0.5) * 6;
    }
}

const lienzo = document.querySelector("#gameCanvas");
const contexto = lienzo.getContext("2d");
const scoreEl = document.querySelector("#score");
const waveEl = document.querySelector("#wave");

let puntos = 0, oleada = 1, npcs = [];
let attackVisualRadius = 0, isAttacking = false, gamePaused = false;
const jugador = new Jugador();
const keys = {};

const spritepersonaje = new Image(); spritepersonaje.src = "sprite.png";
const spritenpc = new Image(); spritenpc.src = "spritenpc.png";

window.addEventListener('resize', () => {
    lienzo.width = window.innerWidth;
    lienzo.height = window.innerHeight;
});
window.dispatchEvent(new Event('resize'));

setInterval(() => {
    if (gamePaused) return;
    oleada++;
    waveEl.innerText = oleada;
    for (let i = 0; i < 5 + oleada; i++) npcs.push(new Npc(lienzo.width, lienzo.height));
}, 5000);

function showUpgradeMenu() {
    gamePaused = true;
    document.getElementById('upgrade-menu').style.display = 'flex';
}

function selectSkill(type) {
    if (type === 'speed') jugador.speed += 2;
    if (type === 'range') jugador.rangoAtaque += 50;
    if (type === 'xp') jugador.xpMultiplier += 0.25;
    document.getElementById('upgrade-menu').style.display = 'none';
    gamePaused = false;
}

function gameOver() {
    gamePaused = true;
    document.getElementById('final-score-val').innerText = puntos;
    document.getElementById('game-over').style.display = 'flex';
}

function checkCollisions() {
    npcs.forEach(npc => {
        let dx = (jugador.x + jugador.size/2) - (npc.x + npc.size/2);
        let dy = (jugador.y + jugador.size/2) - (npc.y + npc.size/2);
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < (jugador.size/2.5)) gameOver();
    });
}

function bucle() {
    if (!gamePaused) {
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        if (keys['w']) jugador.y -= jugador.speed;
        if (keys['s']) jugador.y += jugador.speed;
        if (keys['a']) jugador.x -= jugador.speed;
        if (keys['d']) jugador.x += jugador.speed;

        checkCollisions();

        if (isAttacking) {
            attackVisualRadius += 15;
            let opacity = 1 - (attackVisualRadius / jugador.rangoAtaque);
            contexto.strokeStyle = `rgba(0, 243, 255, ${opacity})`;
            contexto.lineWidth = 4;
            contexto.beginPath();
            contexto.arc(jugador.x + jugador.size/2, jugador.y + jugador.size/2, attackVisualRadius, 0, Math.PI * 2);
            contexto.stroke();
            if (attackVisualRadius > jugador.rangoAtaque) isAttacking = false;
        }

        contexto.drawImage(spritepersonaje, jugador.x, jugador.y, jugador.size, jugador.size);
        npcs.forEach(npc => {
            npc.mueve();
            contexto.drawImage(spritenpc, npc.x, npc.y, npc.size, npc.size);
        });
    }
    requestAnimationFrame(bucle);
}

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space" && !isAttacking && !gamePaused) {
        isAttacking = true;
        attackVisualRadius = 0;
        const totalAntes = npcs.length;
        npcs = npcs.filter(npc => {
            let dx = (jugador.x + jugador.size/2) - (npc.x + npc.size/2);
            let dy = (jugador.y + jugador.size/2) - (npc.y + npc.size/2);
            return Math.sqrt(dx*dx + dy*dy) > jugador.rangoAtaque;
        });
        let killed = totalAntes - npcs.length;
        if (killed > 0) {
            puntos += killed * 10;
            jugador.gainXp(killed * 20);
            scoreEl.innerText = puntos.toString().padStart(4, '0');
        }
    }
});
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
bucle();
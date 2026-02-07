// ==================== GAME CONFIGURATION ====================
const CONFIG = {
    TILE_SIZE: 32,
    MAP_WIDTH: 20,
    MAP_HEIGHT: 15,
    PLAYER_SPEED: 3,
    KEYS_REQUIRED: 3
};

// ==================== AUDIO ENGINE ====================
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.melodyNotes = [];
        this.currentNote = 0;
        this.noteInterval = null;
    }

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.ctx.destination);

        // Custom melody (not Zelda!) - a mysterious adventure tune
        this.melodyNotes = [
            { note: 'E4', duration: 0.3 },
            { note: 'G4', duration: 0.3 },
            { note: 'A4', duration: 0.4 },
            { note: 'G4', duration: 0.2 },
            { note: 'E4', duration: 0.3 },
            { note: 'D4', duration: 0.5 },
            { note: 'E4', duration: 0.3 },
            { note: 'A4', duration: 0.3 },
            { note: 'B4', duration: 0.4 },
            { note: 'A4', duration: 0.2 },
            { note: 'G4', duration: 0.3 },
            { note: 'E4', duration: 0.5 },
            { note: 'D4', duration: 0.3 },
            { note: 'E4', duration: 0.3 },
            { note: 'G4', duration: 0.4 },
            { note: 'A4', duration: 0.6 },
        ];
    }

    noteToFreq(note) {
        const notes = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25,
            'D5': 587.33, 'E5': 659.25
        };
        return notes[note] || 440;
    }

    playNote(freq, duration, type = 'square') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    startMusic() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const playNextNote = () => {
            if (!this.isPlaying) return;

            const noteData = this.melodyNotes[this.currentNote];
            const freq = this.noteToFreq(noteData.note);

            this.playNote(freq, noteData.duration, 'square');

            // Also play a bass note
            this.playNote(freq / 2, noteData.duration * 0.8, 'triangle');

            this.currentNote = (this.currentNote + 1) % this.melodyNotes.length;
        };

        playNextNote();
        this.noteInterval = setInterval(playNextNote, 400);
    }

    stopMusic() {
        this.isPlaying = false;
        if (this.noteInterval) {
            clearInterval(this.noteInterval);
            this.noteInterval = null;
        }
    }

    playPickup() {
        this.playNote(523.25, 0.1, 'square');
        setTimeout(() => this.playNote(659.25, 0.1, 'square'), 100);
        setTimeout(() => this.playNote(783.99, 0.2, 'square'), 200);
    }

    playInteract() {
        this.playNote(440, 0.1, 'sine');
    }
}

// ==================== SPRITE RENDERER ====================
class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // Draw the custom character: guy with glasses, middle part, tan skin
    drawPlayer(x, y, direction, frame) {
        const ctx = this.ctx;
        const s = CONFIG.TILE_SIZE;

        // Animation bob
        const bob = Math.sin(frame * 0.3) * 2;

        ctx.save();
        ctx.translate(x, y + bob);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(s / 2, s - 2, s / 3, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (blue shirt)
        ctx.fillStyle = '#3498db';
        ctx.fillRect(8, 16, 16, 12);

        // Arms
        const armSwing = Math.sin(frame * 0.4) * 3;
        ctx.fillStyle = '#d4a574'; // tan skin
        ctx.fillRect(4, 18 + (direction === 1 ? armSwing : -armSwing), 5, 8);
        ctx.fillRect(23, 18 + (direction === 1 ? -armSwing : armSwing), 5, 8);

        // Legs (dark jeans)
        ctx.fillStyle = '#2c3e50';
        const legSwing = Math.sin(frame * 0.4) * 2;
        ctx.fillRect(10, 28, 5, 6 + legSwing);
        ctx.fillRect(17, 28, 5, 6 - legSwing);

        // Head (tan skin)
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(8, 4, 16, 14);

        // Hair - dark brown with middle part
        ctx.fillStyle = '#3d2314';
        ctx.fillRect(8, 2, 16, 6);
        // Middle part (lighter line)
        ctx.fillStyle = '#5a3825';
        ctx.fillRect(15, 2, 2, 5);
        // Side hair
        ctx.fillStyle = '#3d2314';
        ctx.fillRect(6, 4, 3, 6);
        ctx.fillRect(23, 4, 3, 6);

        // Glasses
        ctx.fillStyle = '#1a1a1a';
        // Left lens frame
        ctx.fillRect(8, 8, 7, 5);
        // Right lens frame
        ctx.fillRect(17, 8, 7, 5);
        // Bridge
        ctx.fillRect(15, 9, 2, 2);
        // Left arm
        ctx.fillRect(6, 9, 2, 2);
        // Right arm
        ctx.fillRect(24, 9, 2, 2);

        // Lens (light blue tint)
        ctx.fillStyle = 'rgba(135, 206, 250, 0.4)';
        ctx.fillRect(9, 9, 5, 3);
        ctx.fillRect(18, 9, 5, 3);

        // Eyes behind glasses
        ctx.fillStyle = '#2c1810';
        if (direction === 0) { // down
            ctx.fillRect(11, 10, 2, 2);
            ctx.fillRect(19, 10, 2, 2);
        } else if (direction === 2) { // up
            ctx.fillRect(11, 9, 2, 2);
            ctx.fillRect(19, 9, 2, 2);
        } else { // left/right
            const offset = direction === 1 ? 1 : -1;
            ctx.fillRect(11 + offset, 10, 2, 2);
            ctx.fillRect(19 + offset, 10, 2, 2);
        }

        // Smile
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(13, 14, 6, 1);

        ctx.restore();
    }

    drawNPC(x, y, type, frame) {
        const ctx = this.ctx;
        const s = CONFIG.TILE_SIZE;

        ctx.save();
        ctx.translate(x, y);

        // Floating animation
        const float = Math.sin(frame * 0.1) * 3;
        ctx.translate(0, float);

        if (type === 'sage') {
            // Wise sage NPC
            ctx.fillStyle = '#8e44ad';
            ctx.fillRect(8, 14, 16, 14);
            ctx.fillStyle = '#f5deb3';
            ctx.fillRect(10, 4, 12, 12);
            ctx.fillStyle = '#bdc3c7';
            // Beard
            ctx.fillRect(12, 12, 8, 8);
            // Eyes
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(12, 8, 2, 2);
            ctx.fillRect(18, 8, 2, 2);
        } else if (type === 'guardian') {
            // Guardian statue
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(6, 8, 20, 22);
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(8, 10, 16, 18);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(14, 16, 4, 4);
        }

        ctx.restore();
    }

    drawKey(x, y, frame) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x + 16, y + 16);
        ctx.rotate(Math.sin(frame * 0.1) * 0.2);

        // Glow
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;

        // Key
        ctx.fillStyle = '#ffd700';
        // Handle
        ctx.beginPath();
        ctx.arc(0, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(0, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        // Shaft
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-2, 0, 4, 12);
        // Teeth
        ctx.fillRect(2, 8, 4, 2);
        ctx.fillRect(2, 4, 3, 2);

        ctx.restore();
    }

    drawTile(x, y, type) {
        const ctx = this.ctx;
        const s = CONFIG.TILE_SIZE;

        switch (type) {
            case 0: // Grass
                ctx.fillStyle = '#2d5a3d';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#3d7a4d';
                for (let i = 0; i < 5; i++) {
                    const gx = x + (Math.sin(x + i) * 10 + 15) % s;
                    const gy = y + (Math.cos(y + i) * 10 + 15) % s;
                    ctx.fillRect(gx, gy, 2, 4);
                }
                break;
            case 1: // Wall/Tree
                ctx.fillStyle = '#1a3d1a';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#2d5a2d';
                ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
                ctx.fillStyle = '#3d7a3d';
                ctx.beginPath();
                ctx.arc(x + s / 2, y + s / 2, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 2: // Path
                ctx.fillStyle = '#5d4e37';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#6d5e47';
                ctx.fillRect(x + 2, y + 2, 4, 4);
                ctx.fillRect(x + 20, y + 14, 6, 6);
                break;
            case 3: // Water
                ctx.fillStyle = '#1a5276';
                ctx.fillRect(x, y, s, s);
                ctx.fillStyle = '#2980b9';
                const wave = Math.sin(Date.now() / 500 + x / 10) * 2;
                ctx.fillRect(x + 4, y + 10 + wave, s - 8, 4);
                break;
        }
    }
}

// ==================== GAME STATE ====================
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new AudioEngine();
        this.renderer = new SpriteRenderer(this.ctx);

        this.player = {
            x: 9 * CONFIG.TILE_SIZE,
            y: 12 * CONFIG.TILE_SIZE,
            direction: 0, // 0: down, 1: right, 2: up, 3: left
            vx: 0,
            vy: 0
        };

        this.keys = {
            up: false, down: false, left: false, right: false, interact: false
        };

        this.keysCollected = 0;
        this.frame = 0;
        this.gameComplete = false;
        this.dialogueActive = false;
        this.currentDialogue = [];
        this.dialogueIndex = 0;
        this.interactCooldown = 0; // Prevent rapid re-triggering
        this.spaceJustPressed = false; // Track single press

        // Game objects
        this.keyItems = [
            { x: 3, y: 3, collected: false },
            { x: 16, y: 2, collected: false },
            { x: 10, y: 7, collected: false }
        ];

        this.npcs = [
            {
                x: 5, y: 7, type: 'sage',
                dialogue: [
                    "Greetings, traveler! You seek the secret, don't you?",
                    "Three Golden Keys are hidden in this realm.",
                    "Find them all, and the secret shall be revealed..."
                ]
            },
            {
                x: 14, y: 5, type: 'guardian',
                dialogue: [
                    "I guard the eastern key.",
                    "Only the worthy may pass...",
                    "...and you seem worthy enough. Go forth!"
                ]
            }
        ];

        // Map: 0=grass, 1=wall, 2=path, 3=water
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 2, 1, 2, 2, 2, 2, 2, 2, 2, 0, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
            [1, 2, 2, 2, 2, 2, 0, 0, 0, 1, 1, 0, 0, 2, 2, 2, 2, 2, 2, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 2, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 2, 1],
            [1, 2, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 2, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': this.keys.up = true; break;
            case 'ArrowDown': case 's': case 'S': this.keys.down = true; break;
            case 'ArrowLeft': case 'a': case 'A': this.keys.left = true; break;
            case 'ArrowRight': case 'd': case 'D': this.keys.right = true; break;
            case ' ':
                e.preventDefault();
                if (!this.keys.interact) {
                    this.keys.interact = true;
                    this.spaceJustPressed = true;
                }
                break;
        }
    }

    handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowUp': case 'w': case 'W': this.keys.up = false; break;
            case 'ArrowDown': case 's': case 'S': this.keys.down = false; break;
            case 'ArrowLeft': case 'a': case 'A': this.keys.left = false; break;
            case 'ArrowRight': case 'd': case 'D': this.keys.right = false; break;
            case ' ':
                this.keys.interact = false;
                this.spaceJustPressed = false;
                break;
        }
    }

    getTile(x, y) {
        const tileX = Math.floor(x / CONFIG.TILE_SIZE);
        const tileY = Math.floor(y / CONFIG.TILE_SIZE);
        if (tileX < 0 || tileX >= CONFIG.MAP_WIDTH || tileY < 0 || tileY >= CONFIG.MAP_HEIGHT) {
            return 1;
        }
        return this.map[tileY][tileX];
    }

    isWalkable(x, y) {
        const tile = this.getTile(x, y);
        return tile !== 1 && tile !== 3;
    }

    checkCollision(newX, newY) {
        const padding = 6;
        return (
            this.isWalkable(newX + padding, newY + padding) &&
            this.isWalkable(newX + CONFIG.TILE_SIZE - padding, newY + padding) &&
            this.isWalkable(newX + padding, newY + CONFIG.TILE_SIZE - padding) &&
            this.isWalkable(newX + CONFIG.TILE_SIZE - padding, newY + CONFIG.TILE_SIZE - padding)
        );
    }

    update() {
        if (this.gameComplete) return;

        this.frame++;

        // Decrease cooldown
        if (this.interactCooldown > 0) {
            this.interactCooldown--;
        }

        // Handle dialogue - only advance on fresh space press
        if (this.dialogueActive) {
            if (this.spaceJustPressed && this.interactCooldown === 0) {
                this.spaceJustPressed = false;
                this.interactCooldown = 15; // Cooldown frames
                this.dialogueIndex++;
                if (this.dialogueIndex >= this.currentDialogue.length) {
                    this.closeDialogue();
                } else {
                    document.getElementById('dialogueText').textContent = this.currentDialogue[this.dialogueIndex];
                }
            }
            return;
        }

        // Movement
        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys.up) {
            newY -= CONFIG.PLAYER_SPEED;
            this.player.direction = 2;
        }
        if (this.keys.down) {
            newY += CONFIG.PLAYER_SPEED;
            this.player.direction = 0;
        }
        if (this.keys.left) {
            newX -= CONFIG.PLAYER_SPEED;
            this.player.direction = 3;
        }
        if (this.keys.right) {
            newX += CONFIG.PLAYER_SPEED;
            this.player.direction = 1;
        }

        if (this.checkCollision(newX, this.player.y)) {
            this.player.x = newX;
        }
        if (this.checkCollision(this.player.x, newY)) {
            this.player.y = newY;
        }

        // Check key collection
        this.keyItems.forEach(key => {
            if (!key.collected) {
                const dx = (this.player.x + 16) - (key.x * CONFIG.TILE_SIZE + 16);
                const dy = (this.player.y + 16) - (key.y * CONFIG.TILE_SIZE + 16);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 24) {
                    key.collected = true;
                    this.keysCollected++;
                    this.audio.playPickup();
                    document.getElementById('keyCount').textContent = `🔑 ${this.keysCollected}/3`;

                    if (this.keysCollected >= CONFIG.KEYS_REQUIRED) {
                        this.completeGame();
                    }
                }
            }
        });

        // Check NPC interaction - only on fresh space press with cooldown
        if (this.spaceJustPressed && this.interactCooldown === 0) {
            this.npcs.forEach(npc => {
                const dx = (this.player.x + 16) - (npc.x * CONFIG.TILE_SIZE + 16);
                const dy = (this.player.y + 16) - (npc.y * CONFIG.TILE_SIZE + 16);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 48 && !this.dialogueActive) {
                    this.showDialogue(npc.dialogue);
                    this.audio.playInteract();
                    this.spaceJustPressed = false;
                    this.interactCooldown = 20;
                }
            });
        }
    }

    showDialogue(dialogue) {
        this.dialogueActive = true;
        this.currentDialogue = dialogue;
        this.dialogueIndex = 0;
        document.getElementById('dialogueBox').classList.remove('hidden');
        document.getElementById('dialogueText').textContent = dialogue[0];
    }

    closeDialogue() {
        this.dialogueActive = false;
        this.currentDialogue = [];
        this.dialogueIndex = 0;
        document.getElementById('dialogueBox').classList.add('hidden');
    }

    completeGame() {
        this.gameComplete = true;
        document.getElementById('questDisplay').textContent = 'Quest Complete!';

        setTimeout(() => {
            document.getElementById('phoneModal').classList.remove('hidden');
        }, 1000);
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#1a3a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw map
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                this.renderer.drawTile(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    this.map[y][x]
                );
            }
        }

        // Draw keys
        this.keyItems.forEach(key => {
            if (!key.collected) {
                this.renderer.drawKey(
                    key.x * CONFIG.TILE_SIZE,
                    key.y * CONFIG.TILE_SIZE,
                    this.frame
                );
            }
        });

        // Draw NPCs
        this.npcs.forEach(npc => {
            this.renderer.drawNPC(
                npc.x * CONFIG.TILE_SIZE,
                npc.y * CONFIG.TILE_SIZE,
                npc.type,
                this.frame
            );
        });

        // Draw player
        this.renderer.drawPlayer(
            this.player.x,
            this.player.y,
            this.player.direction,
            this.frame
        );
    }

    start() {
        this.audio.init();
        this.audio.startMusic();

        const gameLoop = () => {
            this.update();
            this.render();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// ==================== INITIALIZATION ====================
let game;

document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('titleScreen');
    const gameScreen = document.getElementById('gameScreen');
    const startBtn = document.getElementById('startBtn');
    const phoneForm = document.getElementById('phoneForm');
    const phoneInput = document.getElementById('phoneInput');
    const phoneModal = document.getElementById('phoneModal');
    const victoryScreen = document.getElementById('victoryScreen');
    const downloadBtn = document.getElementById('downloadBtn');

    // Start game
    startBtn.addEventListener('click', () => {
        titleScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        game = new Game();
        game.start();
    });

    // Phone input formatting
    phoneInput.addEventListener('input', (e) => {
        e.target.value = PhoneStorage.formatPhoneNumber(e.target.value);
    });

    // Phone form submission
    phoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = phoneInput.value;
        if (phone.length >= 10) {
            PhoneStorage.save(phone);
            phoneModal.classList.add('hidden');
            victoryScreen.classList.remove('hidden');
            document.getElementById('savedNumber').textContent = phone;
        }
    });

    // Download backup
    downloadBtn.addEventListener('click', () => {
        PhoneStorage.downloadAsJSON();
    });
});

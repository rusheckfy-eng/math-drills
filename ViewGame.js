export class ViewGame {
    constructor(onAnswerCallback, onPauseCallback) {
        this.onAnswer = onAnswerCallback;
        this.onPause = onPauseCallback;
        this.container = document.getElementById('game-screen');
    }

    render(profileName, avatar, mode) {
        this.container.innerHTML = `
            <div class="cockpit-header">
                <div>Пилот: <strong id="ui-pilot-name">${profileName}</strong> (${avatar.toUpperCase()})</div>
                <div>Режим: <strong id="ui-pilot-mode" style="color: var(--neon-color)">${mode.toUpperCase()}</strong></div>
            </div>
            
            <div class="visor-container" id="visor">
                <div id="game-question-box">🛸 СИСТЕМЫ ГОТОВЫ</div>
                <div id="game-feedback"></div>
            </div>

            <div class="controls-row">
                <button id="game-pause-btn" class="neon-btn">СТАРТ</button>
            </div>

            <div class="virtual-keyboard">
                <button class="num-btn" data-val="0">0</button>
                <button class="num-btn" data-val="1">1</button>
                <button class="num-btn" data-val="2">2</button>
                <button class="num-btn" data-val="3">3</button>
                <button class="num-btn" data-val="4">4</button>
                <button class="num-btn" data-val="5">5</button>
            </div>
        `;

        document.getElementById('game-pause-btn').addEventListener('click', () => this.onPause());
        
        this.container.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onAnswer(btn.getAttribute('data-val'));
            });
        });
    }

    updateQuestion(text) {
        document.getElementById('game-question-box').innerText = text;
    }

    updateFeedback(text, isCorrect) {
        const fb = document.getElementById('game-feedback');
        fb.innerText = text;
        fb.style.color = isCorrect ? "var(--neon-color)" : "#ff0055";
    }

    setPauseState(isPaused, text = "") {
        const btn = document.getElementById('game-pause-btn');
        const visor = document.getElementById('game-question-box');
        if (isPaused) {
            btn.innerText = "ПРОДОЛЖИТЬ";
            btn.style.background = "#ffaa00";
            visor.innerText = text || "⏸️ НА ПАУЗЕ";
        } else {
            btn.innerText = "ПАУЗА";
            btn.style.background = "transparent";
        }
    }

    triggerShake() {
        const visor = document.getElementById('visor');
        visor.classList.add('shake');
        setTimeout(() => visor.classList.remove('shake'), 400);
    }

    show(visible) {
        this.container.style.display = visible ? 'flex' : 'none';
    }
}

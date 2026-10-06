export class ViewGame {
    constructor(onAnswerCallback, onPauseCallback, onLogoutCallback, onChangeThemeCallback) {
        this.onAnswer = onAnswerCallback;
        this.onPause = onPauseCallback;
        this.onLogout = onLogoutCallback;
        this.onChangeTheme = onChangeThemeCallback;
        this.container = document.getElementById('game-screen');
    }

    render(profileName, avatar, mode, currentTheme) {
        this.container.innerHTML = `
            <div class="cockpit-header">
                <div>Пилот: <strong id="ui-pilot-name">${profileName}</strong></div>
                <button id="menu-toggle-btn" class="mini-btn">МЕНЮ ⚙️</button>
            </div>

            <!-- Выпадающая экспресс-панель изменения настроек пилота -->
            <div id="quick-menu" class="quick-menu hidden">
                <div class="menu-row">
                    <label>Сменить Неон:</label>
                    <select id="quick-theme-select">
                        <option value="theme-azure" ${currentTheme === 'theme-azure' ? 'selected' : ''}>Лазерная Лазурь</option>
                        <option value="theme-purple" ${currentTheme === 'theme-purple' ? 'selected' : ''}>Кибер-Пурпур</option>
                        <option value="theme-emerald" ${currentTheme === 'theme-emerald' ? 'selected' : ''}>Изумрудная Матрица</option>
                    </select>
                </div>
                <button id="quick-logout-btn" class="neon-btn logout">ВЫЙТИ ИЗ ПРОФИЛЯ</button>
            </div>
            
            <div class="visor-container" id="visor">
                <div id="game-question-box">🛸 СИСТЕМЫ ГОТОВЫ</div>
                <div id="game-feedback"></div>
            </div>

            <div class="controls-row">
                <button id="game-pause-btn" class="neon-btn">СТАРТ</button>
            </div>

            <!-- Компактный блок кнопок 0-10 оптимизированный под мобильный экран -->
            <div class="virtual-keyboard grid-10">
                ${Array.from({length: 11}, (_, i) => `<button class="num-btn" data-val="\({i}">\){i}</button>`).join('')}
            </div>
        `;

        // Логика выпадающего меню
        const menuBtn = document.getElementById('menu-toggle-btn');
        const quickMenu = document.getElementById('quick-menu');
        menuBtn.addEventListener('click', () => quickMenu.classList.toggle('hidden'));

        document.getElementById('quick-theme-select').addEventListener('change', (e) => {
            this.onChangeTheme(e.target.value);
        });

        document.getElementById('quick-logout-btn').addEventListener('click', () => {
            this.onLogout();
        });

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

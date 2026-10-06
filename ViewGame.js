export class ViewGame {
    constructor(onAnswerCallback, onPauseCallback, onLogoutCallback, onChangeThemeCallback) {
        this.onAnswer = onAnswerCallback;
        this.onPause = onPauseCallback;
        this.onLogout = onLogoutCallback;
        this.onChangeTheme = onChangeThemeCallback;
        this.container = document.getElementById("game-screen");

        // Инициализируем каркас один раз при создании объекта
        this.initStructure();
        // Кешируем ссылки на элементы локально внутри контейнера
        this.initElements();
        // Вешаем события один раз
        this.initEvents();
    }

    initStructure() {
        this.container.innerHTML = `
            <div class="cockpit-header">
                <div>Пилот: <strong id="ui-pilot-name"></strong></div>
                <button id="menu-toggle-btn" class="mini-btn">МЕНЮ ⚙️</button>
            </div>

            <div id="quick-menu" class="quick-menu hidden">
                <div class="menu-row">
                    <label>Сменить Неон:</label>
                    <select id="quick-theme-select">
                        <option value="theme-azure">Лазерная Лазурь</option>
                        <option value="theme-purple">Кибер-Пурпур</option>
                        <option value="theme-emerald">Изумрудная Матрица</option>
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

            <div class="virtual-keyboard grid-10">
                ${Array.from({length: 11}, (_, i) => `<button class="num-btn" data-val="i">{i}</button>`).join('')}
            </div>
        `;
    }

    initElements() {
        // Ищем строго внутри контейнера, чтобы избежать проблем с глобальным поиском
        this.pilotNameEl = this.container.querySelector("#ui-pilot-name");
        this.menuBtn = this.container.querySelector("#menu-toggle-btn");
        this.quickMenu = this.container.querySelector("#quick-menu");
        this.themeSelect = this.container.querySelector("#quick-theme-select");
        this.logoutBtn = this.container.querySelector("#quick-logout-btn");
        this.pauseBtn = this.container.querySelector("#game-pause-btn");
        this.visor = this.container.querySelector("#visor");
        this.questionBox = this.container.querySelector("#game-question-box");
        this.feedbackBox = this.container.querySelector("#game-feedback");
    }

    initEvents() {
        this.menuBtn.addEventListener("click", () => {
            this.quickMenu.classList.toggle("hidden");
        });

        this.themeSelect.addEventListener("change", (e) => {
            this.onChangeTheme(e.target.value);
        });

        this.logoutBtn.addEventListener("click", () => {
            this.onLogout();
        });

        this.pauseBtn.addEventListener("click", () => {
            this.onPause();
        });
        
        const buttons = this.container.querySelectorAll(".num-btn");
        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                this.onAnswer(btn.getAttribute("data-val"));
            });
        });
    }

    render(profileName, avatar, mode, currentTheme) {
        if (this.pilotNameEl) this.pilotNameEl.innerText = profileName;
        if (this.themeSelect) this.themeSelect.value = currentTheme; 
    }

    updateQuestion(text) {
        if (this.questionBox) this.questionBox.innerText = text;
    }

    updateFeedback(text, isCorrect) {
        if (this.feedbackBox) {
            this.feedbackBox.innerText = text;
            this.feedbackBox.style.color = isCorrect ? "var(--neon-color)" : "#ff0055";
        }
    }

    setPauseState(isPaused, text) {
        if (!this.pauseBtn || !this.questionBox) return;
        const errorMsg = text || "⏸️ НА ПАУЗЕ";
        
        if (isPaused) {
            this.pauseBtn.innerText = "ПРОДОЛЖИТЬ";
            this.pauseBtn.style.background = "#ffaa00";
            this.questionBox.innerText = errorMsg;
        } else {
            this.pauseBtn.innerText = "ПАУЗА";
            this.pauseBtn.style.background = "transparent";
        }
    }

    triggerShake() {
        if (!this.visor) return;
        this.visor.classList.add("shake");
        setTimeout(() => {
            this.visor.classList.remove("shake");
        }, 400);
    }

    show(visible) {
        if (this.container) {
            this.container.style.display = visible ? "flex" : "none";
        }
    }
}

// src/ViewNovel.js

export class ViewNovel {
    constructor(onNextStepCallback, onAnswerCallback, onLogoutCallback) {
        this.onNextStep = onNextStepCallback;
        this.onAnswer = onAnswerCallback;
        this.onLogout = onLogoutCallback;
        
        this.container = document.getElementById("game-screen");
        this.initStructure();
        this.initElements();
        this.initEvents();
    }

    initStructure() {
        this.container.innerHTML = `
            <div class="cockpit-header">
                <div>Пилот: <strong id="ui-pilot-name">---</strong></div>
                <button id="menu-toggle-btn" class="mini-btn">МЕНЮ ⚙️</button>
            </div>

            <!-- Из меню убран выбор цвета визора, осталась только кнопка выхода -->
            <div id="quick-menu" class="quick-menu hidden">
                <button id="quick-logout-btn" class="neon-btn logout">ВЫЙТИ ИЗ ПРОФИЛЯ</button>
            </div>

            <div id="novel-theatre" class="novel-theatre">
                <div class="char-layer left-char hidden" id="char-left"></div>
                <div class="char-layer right-char hidden" id="char-right"></div>
                
                <div class="dialogue-box" id="dialogue-box">
                    <div class="speaker-name" id="speaker-name"></div>
                    <div class="dialogue-text" id="dialogue-text"></div>
                    <div class="click-prompt">▼ Кликни, чтобы читать дальше</div>
                </div>
            </div>

            <div id="math-overlay" class="math-overlay hidden">
                <div class="visor-container" id="visor">
                    <div id="game-question-box">🛸 ПОДКЛЮЧЕНИЕ...</div>
                    <div id="game-feedback"></div>
                </div>
                <div id="math-progress" class="math-progress">Осталось примеров: -</div>

                <div class="virtual-keyboard grid-10">
                    <button class="num-btn" data-val="0">0</button>
                    <button class="num-btn" data-val="1">1</button>
                    <button class="num-btn" data-val="2">2</button>
                    <button class="num-btn" data-val="3">3</button>
                    <button class="num-btn" data-val="4">4</button>
                    <button class="num-btn" data-val="5">5</button>
                    <button class="num-btn" data-val="6">6</button>
                    <button class="num-btn" data-val="7">7</button>
                    <button class="num-btn" data-val="8">8</button>
                    <button class="num-btn" data-val="9">9</button>
                    <button class="num-btn" data-val="10">10</button>
                </div>
            </div>
        `;
    }

    initElements() {
        this.pilotNameEl = this.container.querySelector("#ui-pilot-name");
        this.menuBtn = this.container.querySelector("#menu-toggle-btn");
        this.quickMenu = this.container.querySelector("#quick-menu");
        this.logoutBtn = this.container.querySelector("#quick-logout-btn");
        
        this.theatre = this.container.querySelector("#novel-theatre");
        this.charLeft = this.container.querySelector("#char-left");
        this.charRight = this.container.querySelector("#char-right");
        this.dialogueBox = this.container.querySelector("#dialogue-box");
        this.speakerName = this.container.querySelector("#speaker-name");
        this.dialogueText = this.container.querySelector("#dialogue-text");
        
        this.mathOverlay = this.container.querySelector("#math-overlay");
        this.visor = this.container.querySelector("#visor");
        this.questionBox = this.container.querySelector("#game-question-box");
        this.feedbackBox = this.container.querySelector("#game-feedback");
        this.mathProgress = this.container.querySelector("#math-progress");
    }

    initEvents() {
        this.menuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.quickMenu.classList.toggle("hidden");
        });

        this.logoutBtn.addEventListener("click", () => this.onLogout());

        this.theatre.addEventListener("click", () => {
            if (this.mathOverlay.classList.contains("hidden")) {
                this.onNextStep();
            }
        });

        const buttons = this.container.querySelectorAll(".num-btn");
        buttons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.onAnswer(btn.getAttribute("data-val"));
            });
        });
    }

    renderProfileInfo(profileName) {
        if (this.pilotNameEl) this.pilotNameEl.innerText = profileName;
    }

    // Метод динамического рендеринга персонажей с учетом кастомизации игрока
// Обновленный метод в src/ViewNovel.js

renderChar(element, charData, heroConfig) {
    if (!charData) {
        element.classList.add("hidden");
        return;
    }

    let src = "";
    if (charData.id === "hero") {
        const gender = heroConfig.gender; // "boy" или "girl"
        const suitColor = heroConfig.suit; // "blue", "red", "purple" и т.д.
        const pose = charData.pose;       // Например, "suit_hello"

        // Реальный боевой путь, который будет работать, когда вы доделаете графику
        const targetSrc = `assets/characters/hero/${gender}/${suitColor}/${gender}_${suitColor}_${pose}.png`;

        // СИСТЕМА ОТЛАДОЧНОЙ ПОДМЕНЫ (FALLBACK):
        if (gender === "girl" && suitColor === "red") {
            src = targetSrc; // Используем готовую красную девочку
        } else {
            console.log(`[Отладка графики] Запрошен пустой ассет: ${targetSrc}. Подменяем на референс (girl_red).`);
            // Временно подставляем готовую красную девочку, но с сохранением позы (например, suit_hello)
            src = `assets/characters/hero/girl/red/girl_red_${pose}.png`;
        }
    } else {
        // Сюжетные NPC
        src = `assets/characters/${charData.id}/${charData.pose}.png`;
    }

    element.style.backgroundImage = `url('${src}')`;
    element.classList.remove("hidden");
}


    renderDialogue(step, heroConfig) {
        this.mathOverlay.classList.add("hidden");
        this.dialogueBox.classList.remove("hidden");
        this.theatre.style.backgroundImage = `url('${step.background}')`;

        // Если говорит главный герой, пишем его кастомное имя из профиля
        this.speakerName.innerText = step.speaker === "Командор" ? heroConfig.name : step.speaker;
        this.dialogueText.innerText = step.text;

        // Рендерим левого и правого персонажей
        this.renderChar(this.charLeft, step.leftChar, heroConfig);
        this.renderChar(this.charRight, step.rightChar, heroConfig);
    }

    applySceneTheme(themeClass) {
        document.body.className = '';
        document.body.classList.add(themeClass);
    }

    showMathMode(remainingCount) {
        this.dialogueBox.classList.add("hidden");
        this.mathOverlay.classList.remove("hidden");
        this.updateMathProgress(remainingCount);
    }

    updateMathProgress(count) {
        if (this.mathProgress) this.mathProgress.innerText = `До деактивации защиты осталось: ${count}`;
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

    triggerShake() {
        if (!this.visor) return;
        this.visor.classList.add("shake");
        setTimeout(() => this.visor.classList.remove("shake"), 400);
    }

    show(visible) {
        this.container.style.display = visible ? "flex" : "none";
    }
}

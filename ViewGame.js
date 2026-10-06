export class ViewGame {
    constructor(onAnswerCallback, onPauseCallback, onLogoutCallback, onChangeThemeCallback) {
        this.onAnswer = onAnswerCallback;
        this.onPause = onPauseCallback;
        this.onLogout = onLogoutCallback;
        this.onChangeTheme = onChangeThemeCallback;
        this.container = document.getElementById("game-screen");
    }

    render(profileName, avatar, mode, currentTheme) {
        // Проверяем выбранную тему, чтобы выставить селектору нужное положение
        var selectedAzure = currentTheme === "theme-azure" ? "selected" : "";
        var selectedPurple = currentTheme === "theme-purple" ? "selected" : "";
        var selectedEmerald = currentTheme === "theme-emerald" ? "selected" : "";

        // Сборка интерфейса на обычных двойных кавычках без апострофов и знаков доллара
        var html = "";
        html += "<div class=\"cockpit-header\">";
        html += "    <div>Пилот: <strong id=\"ui-pilot-name\">" + profileName + "</strong></div>";
        html += "    <button id=\"menu-toggle-btn\" class=\"mini-btn\">МЕНЮ ⚙️</button>";
        html += "</div>";

        html += "<!-- Выпадающее экспресс-меню -->";
        html += "<div id=\"quick-menu\" class=\"quick-menu hidden\">";
        html += "    <div class=\"menu-row\">";
        html += "        <label>Сменить Неон:</label>";
        html += "        <select id=\"quick-theme-select\">";
        html += "            <option value=\"theme-azure\" " + selectedAzure + ">Лазерная Лазурь</option>";
        html += "            <option value=\"theme-purple\" " + selectedPurple + ">Кибер-Пурпур</option>";
        html += "            <option value=\"theme-emerald\" " + selectedEmerald + ">Изумрудная Матрица</option>";
        html += "        </select>";
        html += "    </div>";
        html += "    <button id=\"quick-logout-btn\" class=\"neon-btn logout\">ВЫЙТИ ИЗ ПРОФИЛЯ</button>";
        html += "</div>";
        
        html += "<div class=\"visor-container\" id=\"visor\">";
        html += "    <div id=\"game-question-box\">🛸 СИСТЕМЫ ГОТОВЫ</div>";
        html += "    <div id=\"game-feedback\"></div>";
        html += "</div>";

        html += "<div class=\"controls-row\">";
        html += "    <button id=\"game-pause-btn\" class=\"neon-btn\">СТАРТ</button>";
        html += "</div>";

        html += "<!-- Полностью статичная и безопасная клавиатура -->";
        html += "<div class=\"virtual-keyboard grid-10\">";
        html += "    <button class=\"num-btn\" data-val=\"0\">0</button>";
        html += "    <button class=\"num-btn"\" data-val=\"1\">1</button>";
        html += "    <button class=\"num-btn\" data-val=\"2\">2</button>";
        html += "    <button class=\"num-btn\" data-val=\"3\">3</button>";
        html += "    <button class=\"num-btn\" data-val=\"4\">4</button>";
        html += "    <button class=\"num-btn\" data-val=\"5\">5</button>";
        html += "    <button class=\"num-btn\" data-val=\"6\">6</button>";
        html += "    <button class=\"num-btn\" data-val=\"7\">7</button>";
        html += "    <button class=\"num-btn\" data-val=\"8\">8</button>";
        html += "    <button class=\"num-btn\" data-val=\"9\">9</button>";
        html += "    <button class=\"num-btn\" data-val=\"10\">10</button>";
        html += "</div>";

        this.container.innerHTML = html;

        // Логика работы выпадающего меню пилота
        var menuBtn = document.getElementById("menu-toggle-btn");
        var quickMenu = document.getElementById("quick-menu");
        menuBtn.addEventListener("click", function() {
            quickMenu.classList.toggle("hidden");
        });

        var themeSelect = document.getElementById("quick-theme-select");
        var self = this;
        themeSelect.addEventListener("change", function(e) {
            self.onChangeTheme(e.target.value);
        });

        var logoutBtn = document.getElementById("quick-logout-btn");
        logoutBtn.addEventListener("click", function() {
            self.onLogout();
        });

        var pauseBtn = document.getElementById("game-pause-btn");
        pauseBtn.addEventListener("click", function() {
            self.onPause();
        });
        
        // Навешивание событий на все кнопки 0-10
        var buttons = this.container.querySelectorAll(".num-btn");
        buttons.forEach(function(btn) {
            btn.addEventListener("click", function() {
                self.onAnswer(btn.getAttribute("data-val"));
            });
        });
    }

    updateQuestion(text) {
        document.getElementById("game-question-box").innerText = text;
    }

    updateFeedback(text, isCorrect) {
        var fb = document.getElementById("game-feedback");
        fb.innerText = text;
        fb.style.color = isCorrect ? "var(--neon-color)" : "#ff0055";
    }

    setPauseState(isPaused, text) {
        var btn = document.getElementById("game-pause-btn");
        var visor = document.getElementById("game-question-box");
        var errorMsg = text || "⏸️ НА ПАУЗЕ";
        
        if (isPaused) {
            btn.innerText = "ПРОДОЛЖИТЬ";
            btn.style.background = "#ffaa00";
            visor.innerText = errorMsg;
        } else {
            btn.innerText = "ПАУЗА";
            btn.style.background = "transparent";
        }
    }

    triggerShake() {
        var visor = document.getElementById("visor");
        visor.classList.add("shake");
        setTimeout(function() {
            visor.classList.remove("shake");
        }, 400);
    }

    show(visible) {
        this.container.style.display = visible ? "flex" : "none";
    }
}

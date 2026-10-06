    render(profileName, avatar, mode, currentTheme) {
        this.container.innerHTML = `
            <div class="cockpit-header">
                <div>Пилот: <strong id="ui-pilot-name">` + profileName + `</strong></div>
                <button id="menu-toggle-btn" class="mini-btn">МЕНЮ ⚙️</button>
            </div>

            <!-- Выпадающая экспресс-панель изменения настроек пилота -->
            <div id="quick-menu" class="quick-menu hidden">
                <div class="menu-row">
                    <label>Сменить Неон:</label>
                    <select id="quick-theme-select">
                        <option value="theme-azure" ` + (currentTheme === 'theme-azure' ? 'selected' : '') + `>Лазерная Лазурь</option>
                        <option value="theme-purple" ` + (currentTheme === 'theme-purple' ? 'selected' : '') + `>Кибер-Пурпур</option>
                        <option value="theme-emerald" ` + (currentTheme === 'theme-emerald' ? 'selected' : '') + `>Изумрудная Матрица</option>
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

            <!-- Железобетонная клавиатура 0-10 без динамического синтаксиса -->
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
        `;

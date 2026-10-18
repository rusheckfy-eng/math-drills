// src/ViewProfile.js

export class ViewProfile {
    constructor(onLoginCallback) {
        this.onLogin = onLoginCallback;
        this.container = document.getElementById('profile-screen');
        
        // Текущее состояние выбора внутри экрана
        this.selectedGender = "girl";
        this.selectedSuit = "red";
    }

    render() {
        this.container.innerHTML = `
            <div class="auth-card selection-layout">
                <h2>ИНИЦИАЛИЗАЦИЯ ПИЛОТА</h2>
                
                <div class="form-group">
                    <label>Позывной Командора:</label>
                    <input type="text" id="pilot-name" placeholder="Введите имя..." autocomplete="off">
                </div>
                
                <!-- ВЫБОР ПОЛА -->
                <div class="selection-block">
                    <label>ВЫБЕРИТЕ ПИЛОТА:</label>
                    <div class="gender-toggle-row">
                        <button class="selector-btn" data-gender="boy">👦 МАЛЬЧИК</button>
                        <button class="selector-btn active" data-gender="girl">👧 ДЕВОЧКА</button>
                    </div>
                </div>
                
                <!-- ВЫБОР ЦВЕТА СКАФАНДРА -->
                <div class="selection-block">
                    <label>ЦВЕТ КВАНТОВОГО СКАФАНДРА:</label>
                    <div id="suit-color-row" class="suit-color-row">
                        <!-- Кнопки цветов генерируются динамически -->
                    </div>
                </div>

                <div class="form-group-checkbox">
                    <input type="checkbox" id="pilot-remember" checked>
                    <label for="pilot-remember">Запомнить Командора</label>
                </div>
                
                <button id="btn-enter-orbit" class="neon-btn match-start-btn">АКТИВИРОВАТЬ СТРЕЛУ-ИКС 🚀</button>
            </div>
        `;

        this.renderSuitColors();
        this.initLocalEvents();
    }

    renderSuitColors() {
        const colorRow = this.container.querySelector("#suit-color-row");
        
        // Популярные цвета под каждый пол
        const colors = {
            girl: [
                { id: "red", name: "Красный Лазер 🔴" },
                { id: "purple", name: "Кибер-Пурпур 🟣" },
                { id: "yellow", name: "Неоновый Кварц 🟡" }
            ],
            boy: [
                { id: "blue", name: "Квантовый Синий 🔵" },
                { id: "green", name: "Изумрудная Матрица 🟢" },
                { id: "orange", name: "Солнечный Импульс 🟠" }
            ]
        };

        const activeColors = colors[this.selectedGender];
        
        // Если при смене пола старого цвета нет в новом списке, сбрасываем на первый доступный
        if (!activeColors.some(c => c.id === this.selectedSuit)) {
            this.selectedSuit = activeColors[0].id;
        }

        colorRow.innerHTML = activeColors.map(color => `
            <button class="color-btn ${color.id === this.selectedSuit ? 'active' : ''}" data-color="${color.id}">
                ${color.name}
            </button>
        `).join('');

        // Перевешиваем события на новые кнопки цветов
        colorRow.querySelectorAll(".color-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                colorRow.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedSuit = btn.getAttribute("data-color");
            });
        });
    }

    initLocalEvents() {
        // Логика переключения кнопок Мальчик/Девочка
        const genderBtns = this.container.querySelectorAll(".gender-toggle-row .selector-btn");
        genderBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                genderBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedGender = btn.getAttribute("data-gender");
                
                // Перерисовываем цвета под выбранный пол
                this.renderSuitColors();
            });
        });

        // Кнопка финального входа
        document.getElementById('btn-enter-orbit').addEventListener('click', () => {
            const name = document.getElementById('pilot-name').value.trim();
            if (!name) return alert("Командор, введите свой позывной!");
            
            const remember = document.getElementById('pilot-remember').checked;
            
            this.onLogin({ 
                name, 
                gender: this.selectedGender, 
                suit: this.selectedSuit, 
                remember 
            });
        });
    }

    show(visible) {
        this.container.style.display = visible ? 'flex' : 'none';
    }
}

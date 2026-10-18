// src/ViewProfile.js

export class ViewProfile {
    constructor(onLoginCallback) {
        this.onLogin = onLoginCallback;
        this.container = document.getElementById('profile-screen');
        
        // Текущее состояние выбора внутри экрана
        this.selectedGender = "girl";
        this.selectedSuit = "red";
    }

// src/ViewProfile.js

render() {
    this.container.innerHTML = `
        <div class="auth-card landscape-profile-card">
            <h2>🛸 ИНИЦИАЛИЗАЦИЯ ПИЛОТА</h2>
            
            <div class="profile-grid-container">
                <!-- ЛЕВАЯ КОЛОНКА -->
                <div class="profile-column">
                    <div class="form-group">
                        <label>Позывной Командора:</label>
                        <input type="text" id="pilot-name" placeholder="Введи имя..." autocomplete="off">
                    </div>
                    
                    <div class="selection-block">
                        <label>Выбери пилота:</label>
                        <div class="gender-toggle-row">
                            <button class="selector-btn" data-gender="boy">👦 МАЛЬЧИК</button>
                            <button class="selector-btn active" data-gender="girl">👧 ДЕВОЧКА</button>
                        </div>
                    </div>
                </div>
                
                <!-- ПРАВАЯ КОЛОНКА -->
                <div class="profile-column">
                    <div class="selection-block">
                        <label>Цвет квантового скафандра:</label>
                        <div id="suit-color-row" class="suit-color-row-vertical">
                            <!-- Кнопки цветов сгенерируются кодом -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- НИЖНЯЯ ПАНЕЛЬ С КНОПКОЙ -->
            <div class="profile-footer-row">
                <div class="form-group-checkbox">
                    <input type="checkbox" id="pilot-remember" checked>
                    <label for="pilot-remember">Запомнить меня</label>
                </div>
                <button id="btn-enter-orbit" class="neon-btn match-start-btn">ПОГНАЛИ! 🚀</button>
            </div>
        </div>
    `;

    this.renderSuitColors();
    this.initLocalEvents();
}

// Обновим также метод рендеринга цветов, чтобы он подходил под новую сетку
renderSuitColors() {
    const colorRow = this.container.querySelector("#suit-color-row");
    
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
    
    if (!activeColors.some(c => c.id === this.selectedSuit)) {
        this.selectedSuit = activeColors[0].id;
    }

    colorRow.innerHTML = activeColors.map(color => `
        <button class="color-btn ${color.id === this.selectedSuit ? 'active' : ''}" data-color="${color.id}">
            ${color.name}
        </button>
    `).join('');

    colorRow.querySelectorAll(".color-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            colorRow.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            this.selectedSuit = btn.getAttribute("data-color");
        });
    });
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

export class ViewProfile {
    constructor(onLoginCallback) {
        this.onLogin = onLoginCallback;
        this.container = document.getElementById('profile-screen');
    }

    render() {
        this.container.innerHTML = `
            <div class="auth-card">
                <h2>ИНИЦИАЛИЗАЦИЯ ПИЛОТА</h2>
                <div class="form-group">
                    <label>Позывной Командора:</label>
                    <input type="text" id="pilot-name" placeholder="Введите имя..." autocomplete="off">
                </div>
                <div class="form-group">
                    <label>Шлем (Аватар):</label>
                    <select id="pilot-avatar">
                        <option value="scout">🚀 Скаут</option>
                        <option value="cyborg">🤖 Киборг</option>
                        <option value="hunter">🛸 Охотник</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Неоновый интерфейс:</label>
                    <select id="pilot-theme">
                        <option value="theme-azure">Лазерная Лазурь</option>
                        <option value="theme-purple">Кибер-Пурпур</option>
                        <option value="theme-emerald">Изумрудная Матрица</option>
                    </select>
                </div>
                <button id="btn-enter-orbit" class="neon-btn">ВХОД НА ОРБИТУ</button>
            </div>
        `;

        document.getElementById('btn-enter-orbit').addEventListener('click', () => this.handleLogin());
    }

    handleLogin() {
        const name = document.getElementById('pilot-name').value.trim();
        if (!name) return alert("Введите имя Командора!");
        
        const avatar = document.getElementById('pilot-avatar').value;
        const theme = document.getElementById('pilot-theme').value;
        
        this.onLogin({ name, avatar, theme });
    }

    show(visible) {
        this.container.style.display = visible ? 'flex' : 'none';
    }
}

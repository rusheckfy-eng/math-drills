import { AdaptiveEngine } from './AdaptiveEngine.js';
import { ViewProfile } from './ViewProfile.js';
import { ViewGame } from './ViewGame.js';

let engine = null;
let watchDogInterval = null;

const adminScreen = document.getElementById('admin-screen');

// Контроллер инициализирует View-слои, передавая обработчики обратного вызова
const viewProfile = new ViewProfile(handleLoginSuccess);
const viewGame = new ViewGame(handleUserAnswer, togglePause, handleLogout, handleThemeChange);

viewProfile.render();

// ПРОВЕРКА АВТОВХОДА (Запомнить меня)
const savedSession = localStorage.getItem('math_drill_active_session');
if (savedSession) {
    const sessionData = JSON.parse(savedSession);
    handleLoginSuccess({ ...sessionData, remember: true });
} else {
    viewProfile.show(true);
}

function handleLoginSuccess({ name, avatar, theme, remember }) {
    viewProfile.show(false);

    if (name.toLowerCase() === 'admin') {
        adminScreen.style.display = 'block';
        initAdminPanel();
        return;
    }

    // Инициализация адаптивного ядра
    engine = new AdaptiveEngine(name);
    if (!localStorage.getItem(engine.storageKey)) {
        engine.profile = engine.createNewProfile(name, 3, avatar, theme);
        engine.saveProfile();
    }

    // Если был выбран чекбокс, сохраняем токен автологина
    if (remember) {
        localStorage.setItem('math_drill_active_session', JSON.stringify({
            name: engine.profile.name,
            avatar: engine.profile.avatar,
            theme: engine.profile.theme
        }));
    }

    applyVisualTheme(engine.profile.theme);

    adminScreen.style.display = 'none';
    viewGame.show(true);
    viewGame.render(engine.profile.name, engine.profile.avatar, engine.profile.mode, engine.profile.theme);
}

function handleThemeChange(newTheme) {
    if (!engine) return;
    engine.profile.theme = newTheme;
    engine.saveProfile();
    
    // Обновляем сессию автологина, если она активна
    const session = localStorage.getItem('math_drill_active_session');
    if (session) {
        const parsed = JSON.parse(session);
        parsed.theme = newTheme;
        localStorage.setItem('math_drill_active_session', JSON.stringify(parsed));
    }
    
    applyVisualTheme(newTheme);
}

function handleLogout() {
    stopWatchDog();
    if (engine) engine.setPause(true);
    
    localStorage.removeItem('math_drill_active_session'); // Сброс автологина
    engine = null;
    
    viewGame.show(false);
    adminScreen.style.display = 'none';
    viewProfile.show(true);
    viewProfile.render();
}

function applyVisualTheme(themeClass) {
    document.body.className = '';
    document.body.classList.add(themeClass);
}

function handleUserAnswer(value) {
    if (!engine || engine.isPaused) return;

    const result = engine.submitAnswer(value);

    if (result.isAnomaly) {
        triggerAutoPauseAction(result.logMessage);
        return;
    }

    // Изменение логики согласно ТЗ: текст вердикта выводится ПРЯМО вместо примера
    if (result.isCorrect) {
        viewGame.updateQuestion("🚀 ВЕЛИКОЛЕПНО!");
        viewGame.updateFeedback("", true); 
    } else {
        viewGame.updateQuestion("💥 ПРОМАХ!");
        viewGame.updateFeedback("", false);
        viewGame.triggerShake(); // Трясем визор при сбое
    }

    // Раунды визуально отделяются: вердикт горит ровно 1 секунду, затем летит новый пример
    setTimeout(nextRound, 1000);
}

function nextRound() {
    if (!engine || engine.isPaused) return;
    
    viewGame.updateFeedback("", true);
    const question = engine.generateNextQuestion();
    
    if (question) {
        viewGame.updateQuestion(question.text);
    } else {
        viewGame.updateQuestion("Миссия завершена! 100% Автоматизм!");
    }
}

function togglePause() {
    const newState = !engine.isPaused;
    engine.setPause(newState);

    if (newState) {
        viewGame.setPauseState(true, "⏸️ ИГРА НА ПАУЗЕ");
        stopWatchDog();
    } else {
        viewGame.setPauseState(false);
        nextRound();
        startWatchDog();
    }
}

function triggerAutoPauseAction() {
    stopWatchDog();
    if (engine) engine.setPause(true);
    viewGame.setPauseState(true, "⏸️ АВТОПАУЗА: ВЫ ОТВЛЕКЛИСЬ");
}

function startWatchDog() {
    stopWatchDog();
    watchDogInterval = setInterval(() => {
        if (engine && !engine.isPaused && engine.startTime > 0) {
            const currentElapsed = performance.now() - engine.startTime;
            if (currentElapsed > engine.profile.config.ANOMALY_LIMIT) {
                triggerAutoPauseAction();
            }
        }
    }, 1000);
}

function stopWatchDog() {
    if (watchDogInterval) {
        clearInterval(watchDogInterval);
        watchDogInterval = null;
    }
}

// Физическая клавиатура расширена до поддержки клавиш 0-10
window.addEventListener('keydown', (e) => {
    if (!engine || document.getElementById('profile-screen').style.display !== 'none') return;

    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
    } else {
        // Проверка ввода чисел от 0 до 10
        let numInt = parseInt(e.key);
        if (!isNaN(numInt) && numInt >= 0 && numInt <= 10) {
            handleUserAnswer(e.key);
        } else if (e.key === '0' || e.key === '1') {
            handleUserAnswer(e.key);
        }
    }
});

function initAdminPanel() {
    adminScreen.innerHTML = `<h1>Панель Инженера (Admin Mode)</h1><p>Доступ открыт.</p><button id="admin-logout" class="neon-btn">Выйти</button>`;
    document.getElementById('admin-logout').addEventListener('click', handleLogout);
}

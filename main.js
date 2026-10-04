import { AdaptiveEngine } from './AdaptiveEngine.js';
import { ViewProfile } from './ViewProfile.js';
import { ViewGame } from './ViewGame.js';

let engine = null;
let watchDogInterval = null;

// Экраны-контейнеры из DOM
const adminScreen = document.getElementById('admin-screen');

// Инициализация View слоев
const viewProfile = new ViewProfile(handleLoginSuccess);
const viewGame = new ViewGame(handleUserAnswer, togglePause);

viewProfile.render();

function handleLoginSuccess({ name, avatar, theme }) {
    viewProfile.show(false);

    if (name.toLowerCase() === 'admin') {
        adminScreen.style.display = 'block';
        initAdminPanel();
        return;
    }

    // Загрузка или создание профиля игрока
    engine = new AdaptiveEngine(name);
    if (!localStorage.getItem(engine.storageKey)) {
        engine.profile = engine.createNewProfile(name, 3, avatar, theme);
        engine.saveProfile();
    }

    // Применяем тему оформления
    document.body.className = '';
    document.body.classList.add(engine.profile.theme);

    adminScreen.style.display = 'none';
    viewGame.show(true);
    viewGame.render(engine.profile.name, engine.profile.avatar, engine.profile.mode);
}

function handleUserAnswer(value) {
    if (!engine || engine.isPaused) return;

    const cfg = engine.profile.config;
    const result = engine.submitAnswer(value);

    if (result.isAnomaly) {
        triggerAutoPauseAction(result.logMessage);
        return;
    }

    if (result.isCorrect) {
        viewGame.updateFeedback("🚀 ВЕЛИКОЛЕПНО!", true);
    } else {
        viewGame.updateFeedback("💥 СБОЙ СИСТЕМЫ", false);
        viewGame.triggerShake();
    }

    setTimeout(nextRound, cfg.ROUND_DELAY);
}

function nextRound() {
    if (engine.isPaused) return;
    
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

function triggerAutoPauseAction(message) {
    stopWatchDog();
    engine.setPause(true);
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

// Перехват физической клавиатуры (Кнопки 0-5 и Пробел)
window.addEventListener('keydown', (e) => {
    if (!engine || viewProfile.container.style.display !== 'none') return;

    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
    } else if (['0', '1', '2', '3', '4', '5'].includes(e.key)) {
        handleUserAnswer(e.key);
    }
});

// Заглушка под админку (бывший отладочный стенд)
function initAdminPanel() {
    adminScreen.innerHTML = `<h1>Панель Инженера (Admin Mode)</h1><p>Доступ ко всем матрицам открыт.</p>`;
}

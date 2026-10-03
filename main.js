// main.js - Управление циклом Автопаузы и состояниями Старт/Пауза
import { AdaptiveEngine } from './AdaptiveEngine.js';

let engine = new AdaptiveEngine("Командор_Лео");

const questionBox = document.getElementById('question-box');
const answerInput = document.getElementById('answer-input');
const pauseBtn = document.getElementById('pause-btn');
const feedback = document.getElementById('feedback');
const matrixBody = document.getElementById('matrix-body');
const logStream = document.getElementById('log-stream');
const sessionInfo = document.getElementById('session-info');

const setStartRange = document.getElementById('setting-start-range');
const setAutoLimit = document.getElementById('setting-auto-limit');
const setAnomalyLimit = document.getElementById('setting-anomaly-limit');
const setPenaltyTime = document.getElementById('setting-penalty-time');
const setMode = document.getElementById('setting-mode');
const applySettingsBtn = document.getElementById('apply-settings-btn');

// Фоновый сторожевой таймер для отслеживания зависания
let watchDogInterval = null;

function syncEngineSettings() {
    engine.AUTO_LIMIT = parseInt(setAutoLimit.value);
    engine.ANOMALY_LIMIT = parseInt(setAnomalyLimit.value);
    engine.PENALTY_TIME = parseInt(setPenaltyTime.value);
    engine.profile.mode = setMode.value;
}

function renderProfileData() {
    if (engine.isPaused && !engine.hasStartedBefore) {
        sessionInfo.innerHTML = "Системы ждут запуска. Нажмите СТАРТ.";
        return;
    }
    sessionInfo.innerHTML = `Пилот: <strong>${engine.profile.name}</strong> | Операция: <strong style="color:#00ffcc">${engine.profile.mode.toUpperCase()}</strong> | Числовой лимит: <strong>до ${engine.profile.maxUnlockedNumber}</strong>`;

    matrixBody.innerHTML = '';
    Object.keys(engine.profile.matrix).forEach(key => {
        const node = engine.profile.matrix[key];
        const [sum, a1, a2] = key.split('_');
        
        let statusText = `<span style="color:#666">🔒 Закрыто</span>`;
        if (node.unlocked) {
            statusText = node.mastered ? `<span style="color:#00ffcc; font-weight:bold;">🌟 Автомат</span>` : `<span style="color:#ffaa00">⏳ В работе</span>`;
        }

        const row = `
            <tr>
                <td>Число <strong>${sum}</strong> состоит из (${a1} и ${a2})</td>
                <td>${node.unlocked ? '✅' : '❌'}</td>
                <td>${node.total}</td>
                <td>${node.unlocked ? (node.ema / 1000).toFixed(2) + ' с' : '--'}</td>
                <td>${statusText}</td>
            </tr>
        `;
        matrixBody.insertAdjacentHTML('beforeend', row);
    });
}

function nextRound() {
    if (engine.isPaused) return;

    feedback.innerText = "";
    answerInput.value = '';
    answerInput.disabled = false;
    answerInput.classList.remove('hidden');
    
    const question = engine.generateNextQuestion();
    if (question) {
        questionBox.innerText = question.text;
        answerInput.focus();
    } else {
        questionBox.innerText = "Миссия завершена! 100% Автоматизм!";
        answerInput.disabled = true;
    }
    renderProfileData();
}

function processAnswer() {
    if (engine.isPaused) return;

    const value = answerInput.value.trim();
    if (!value) return; 

    answerInput.disabled = true;
    syncEngineSettings(); 
    
    const result = engine.submitAnswer(value);
    
    // Перехват автопаузы из ядра
    if (result.isAnomaly) {
        triggerAutoPauseAction(result.logMessage);
        return;
    }

    if (result.isCorrect) {
        feedback.innerText = "🚀 ВЕЛИКОЛЕПНО!";
        feedback.style.color = "#00ffcc";
    } else {
        feedback.innerText = "💥 СБОЙ СИСТЕМЫ (ПРОМАХ)";
        feedback.style.color = "#ff0055";
    }

    const logItem = `<div>[${new Date().toLocaleTimeString()}] Триада ${result.key}: ${result.logMessage}</div>`;
    logStream.insertAdjacentHTML('afterbegin', logItem);

    setTimeout(nextRound, 1000); 
}

// Принудительный перевод в состояние автопаузы
function triggerAutoPauseAction(message) {
    stopWatchDog();
    engine.setPause(true);
    
    pauseBtn.innerText = "ПРОДОЛЖИТЬ";
    pauseBtn.style.background = "#ffaa00";
    questionBox.innerText = "⏸️ АВТОПАУЗА: ВЫ ОТВЛЕКЛИСЬ";
    answerInput.classList.add('hidden');
    
    logStream.insertAdjacentHTML('afterbegin', `<div style="color:#ffaa00">[${new Date().toLocaleTimeString()}] ${message}</div>`);
    renderProfileData();
}

// Логика кнопки Старт / Пауза / Продолжить
function togglePause() {
    const newState = !engine.isPaused;
    
    if (!engine.hasStartedBefore) {
        engine.hasStartedBefore = true; // Игра перешла в активную фазу
    }

    engine.setPause(newState);

    if (newState) {
        // Включение ручной паузы
        pauseBtn.innerText = "ПРОДОЛЖИТЬ";
        pauseBtn.style.background = "#ffaa00";
        questionBox.innerText = "⏸️ ИГРА НА ПАУЗЕ";
        answerInput.classList.add('hidden');
        stopWatchDog();
    } else {
        // Старт или снятие с паузы
        pauseBtn.innerText = "ПАУЗА";
        pauseBtn.style.background = "#4af626";
        nextRound();
        startWatchDog();
    }
}

// Запуск фонового надзора за временем
function startWatchDog() {
    stopWatchDog(); // На всякий случай чистим старый
    watchDogInterval = setInterval(() => {
        if (!engine.isPaused && engine.startTime > 0) {
            const currentElapsed = performance.now() - engine.startTime;
            if (currentElapsed > engine.ANOMALY_LIMIT) {
                triggerAutoPauseAction(`Автопауза: Превышен лимит ожидания ответа (${engine.ANOMALY_LIMIT / 1000}с).`);
            }
        }
    }, 1000); // Проверка каждую секунду
}

function stopWatchDog() {
    if (watchDogInterval) {
        clearInterval(watchDogInterval);
        watchDogInterval = null;
    }
}

// Применение настроек отладки
applySettingsBtn.addEventListener('click', () => {
    stopWatchDog();
    localStorage.removeItem(engine.storageKey); 
    engine = new AdaptiveEngine("Командор_Лео"); 
    
    engine.profile = engine.loadOrCreateProfile("Командор_Лео", setStartRange.value);
    syncEngineSettings();
    engine.saveProfile();
    
    pauseBtn.innerText = "СТАРТ";
    pauseBtn.style.background = "#00ffcc";
    questionBox.innerText = "🛸 СИСТЕМЫ СТАТИЧНЫ";
    answerInput.classList.add('hidden');
    
    logStream.insertAdjacentHTML('afterbegin', `<div style="color:#00ffcc; font-weight:bold;">[СИСТЕМА] Профиль сброшен. Нажмите СТАРТ для начала.</div>`);
    renderProfileData();
});

answerInput.addEventListener('input', () => {
    if (answerInput.value.length > 0) processAnswer();
});

pauseBtn.addEventListener('click', togglePause);

// Первая инициализация (в состоянии ожидания старта)
syncEngineSettings();
renderProfileData();

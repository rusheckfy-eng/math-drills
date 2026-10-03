// main.js - Управление интерфейсом, связывание Ядра и Config.js
import { AdaptiveEngine } from './AdaptiveEngine.js';
import { Config } from './Config.js';

let engine = new AdaptiveEngine("Командор_Лео");

const questionBox = document.getElementById('question-box');
const answerInput = document.getElementById('answer-input');
const pauseBtn = document.getElementById('pause-btn');
const feedback = document.getElementById('feedback');
const matrixBody = document.getElementById('matrix-body');
const logStream = document.getElementById('log-stream');
const sessionInfo = document.getElementById('session-info');

// Элементы UI
const setStartRange = document.getElementById('setting-start-range');
const setAutoLimit = document.getElementById('setting-auto-limit');
const setAnomalyLimit = document.getElementById('setting-anomaly-limit');
const setPenaltyTime = document.getElementById('setting-penalty-time');
const setAlpha = document.getElementById('setting-alpha');
const setBaseStart = document.getElementById('setting-base-start'); // Новый элемент
const setSumMult = document.getElementById('setting-sum-mult');     // Новый элемент
const setMode = document.getElementById('setting-mode');
const applySettingsBtn = document.getElementById('apply-settings-btn');

let watchDogInterval = null;

function syncEngineSettings() {
    Config.update({
        autoLimit: setAutoLimit.value,
        anomalyLimit: setAnomalyLimit.value,
        penaltyTime: setPenaltyTime.value,
        alpha: setAlpha.value,
        baseStartTime: setBaseStart.value, // Передаем стартовую базу
        sumMultiplier: setSumMult.value    // Передаем шаг сложности
    });
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

    setTimeout(nextRound, Config.ROUND_DELAY); 
}

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

function togglePause() {
    const newState = !engine.isPaused;
    
    if (!engine.hasStartedBefore) {
        engine.hasStartedBefore = true;
    }

    engine.setPause(newState);

    if (newState) {
        pauseBtn.innerText = "ПРОДОЛЖИТЬ";
        pauseBtn.style.background = "#ffaa00";
        questionBox.innerText = "⏸️ ИГРА НА ПАУЗЕ";
        answerInput.classList.add('hidden');
        stopWatchDog();
    } else {
        pauseBtn.innerText = "ПАУЗА";
        pauseBtn.style.background = "#4af626";
        nextRound();
        startWatchDog();
    }
}

function startWatchDog() {
    stopWatchDog(); 
    watchDogInterval = setInterval(() => {
        if (!engine.isPaused && engine.startTime > 0) {
            const currentElapsed = performance.now() - engine.startTime;
            if (currentElapsed > Config.ANOMALY_LIMIT) {
                triggerAutoPauseAction(`Автопауза: Превышен лимит ожидания ответа (${Config.ANOMALY_LIMIT / 1000}с).`);
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

applySettingsBtn.addEventListener('click', () => {
    stopWatchDog();
    localStorage.removeItem(engine.storageKey); 
    
    // ВАЖНО: Сначала синхронизируем конфиг, чтобы новое ядро сгенерировало матрицу по новым правилам весов!
    syncEngineSettings();
    
    engine = new AdaptiveEngine("Командор_Лео"); 
    engine.profile = engine.loadOrCreateProfile("Командор_Лео", setStartRange.value);
    engine.saveProfile();
    
    pauseBtn.innerText = "СТАРТ";
    pauseBtn.style.background = "#00ffcc";
    questionBox.innerText = "🛸 СИСТЕМЫ СТАТИЧНЫ";
    answerInput.classList.add('hidden');
    
    logStream.insertAdjacentHTML('afterbegin', `<div style="color:#00ffcc; font-weight:bold;">[СИСТЕМА] Профиль сброшен. Матрица собрана с новыми стартовыми весами.</div>`);
    renderProfileData();
});

answerInput.addEventListener('input', () => {
    if (answerInput.value.length > 0) processAnswer();
});

pauseBtn.addEventListener('click', togglePause);

syncEngineSettings();
renderProfileData();

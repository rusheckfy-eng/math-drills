// main.js - Контроллер с мгновенным вводом, паузами раундов и панелью отладки
import { AdaptiveEngine } from './AdaptiveEngine.js';

let engine = new AdaptiveEngine("Командор_Лео");

const questionBox = document.getElementById('question-box');
const answerInput = document.getElementById('answer-input');
const pauseBtn = document.getElementById('pause-btn');
const feedback = document.getElementById('feedback');
const matrixBody = document.getElementById('matrix-body');
const logStream = document.getElementById('log-stream');
const sessionInfo = document.getElementById('session-info');

// Элементы панели настроек
const setStartRange = document.getElementById('setting-start-range');
const setAutoLimit = document.getElementById('setting-auto-limit');
const setAnomalyLimit = document.getElementById('setting-anomaly-limit');
const setPenaltyTime = document.getElementById('setting-penalty-time');
const setMode = document.getElementById('setting-mode');
const applySettingsBtn = document.getElementById('apply-settings-btn');

function syncEngineSettings() {
    engine.AUTO_LIMIT = parseInt(setAutoLimit.value);
    engine.ANOMALY_LIMIT = parseInt(setAnomalyLimit.value);
    engine.PENALTY_TIME = parseInt(setPenaltyTime.value);
    engine.profile.mode = setMode.value;
}

function renderProfileData() {
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

    // Очищаем фидбек перед новым примером
    feedback.innerText = "";
    answerInput.value = '';
    answerInput.disabled = false;
    
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
    if (!value) return; // Игнорируем пустой ввод

    // Блокируем инпут на время паузы-задержки между примерами, чтобы ребенок не спамил кнопками
    answerInput.disabled = true;

    syncEngineSettings(); // Подтягиваем актуальные лимиты времени с панели перед расчетом
    const result = engine.submitAnswer(value);
    
    if (result.isAnomaly) {
        feedback.innerText = "💤 ОТВЛЁКСЯ. СБРОС ТАЙМЕРА.";
        feedback.style.color = "#ffaa00";
        logStream.insertAdjacentHTML('afterbegin', `<div style="color:#ffaa00">[${new Date().toLocaleTimeString()}] ${result.logMessage}</div>`);
        setTimeout(nextRound, 1200); // Комфортная пауза задержки перед новым примером
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

    setTimeout(nextRound, 1000); // 1 секунда паузы между примерами, чтобы зафиксировать фидбек
}

function togglePause() {
    const newState = !engine.isPaused;
    engine.setPause(newState);

    if (newState) {
        pauseBtn.innerText = "ИГРА СТОИТ";
        pauseBtn.style.background = "#ffaa00";
    } else {
        pauseBtn.innerText = "ПАУЗА";
        pauseBtn.style.background = "#4af626";
        nextRound();
    }
    answerInput.focus();
}

// Применение ручных настроек отладки с полной перезагрузкой профиля
applySettingsBtn.addEventListener('click', () => {
    localStorage.removeItem(engine.storageKey); // Стираем старый тест-профиль
    engine = new AdaptiveEngine("Командор_Лео"); // Создаем заново
    
    // Пересоздаем профиль с выбранным числом доступных цифр изначально
    engine.profile = engine.loadOrCreateProfile("Командор_Лео", setStartRange.value);
    syncEngineSettings();
    engine.saveProfile();
    
    logStream.insertAdjacentHTML('afterbegin', `<div style="color:#00ffcc; font-weight:bold;">[СИСТЕМА] Профиль перезапущен. Изначально открыты числа до ${setStartRange.value}</div>`);
    nextRound();
});

// Слушаем событие ввода (input) вместо клика на кнопку — для мгновенной реакции
answerInput.addEventListener('input', () => {
    // Ждем, пока в инпут попадет хотя бы один символ
    if (answerInput.value.length > 0) {
        processAnswer();
    }
});

pauseBtn.addEventListener('click', togglePause);

// Первая инициализация
syncEngineSettings();
nextRound();

// main.js - Контроллер интерфейса с поддержкой паузы
import { AdaptiveEngine } from './AdaptiveEngine.js';

const engine = new AdaptiveEngine("Командор_Лео");

const questionBox = document.getElementById('question-box');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const pauseBtn = document.getElementById('pause-btn');
const feedback = document.getElementById('feedback');
const matrixBody = document.getElementById('matrix-body');
const logStream = document.getElementById('log-stream');
const sessionInfo = document.getElementById('session-info');

function renderProfileData() {
    sessionInfo.innerHTML = `Пилот: <strong>${engine.profile.name}</strong> | Операция: <strong style="color:#00ffcc">${engine.profile.mode.toUpperCase()}</strong> | Макс. число: <strong>${engine.profile.maxUnlockedNumber}</strong>`;

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
                <td>Число <strong>${sum}</strong> из (${a1} + ${a2})</td>
                <td>${node.unlocked ? '✅' : '❌'}</td>
                <td>${node.total}</td>
                <td>${node.unlocked ? (node.ema / 1000).toFixed(2) + ' сек' : '--'}</td>
                <td>${statusText}</td>
            </tr>
        `;
        matrixBody.insertAdjacentHTML('beforeend', row);
    });
}

function nextRound() {
    if (engine.isPaused) return;

    const question = engine.generateNextQuestion();
    if (question) {
        questionBox.innerText = question.text;
        answerInput.value = '';
        answerInput.style.display = 'inline-block';
        answerInput.focus();
    } else {
        questionBox.innerText = "Миссия завершена! 100% Автоматизм!";
    }
    renderProfileData();
}

function processAnswer() {
    if (engine.isPaused) return;

    const value = answerInput.value.trim();
    if (!value) return;

    const result = engine.submitAnswer(value);
    
    // Проверяем, не отвлекся ли ребенок
    if (result.isAnomaly) {
        feedback.innerText = "ПИЛОТ ОТВЛЁКСЯ. СБРОС ТАЙМЕРА.";
        feedback.style.color = "#ffaa00";
        
        const logItem = `<div style="color:#ffaa00">[${new Date().toLocaleTimeString()}] ${result.logMessage}</div>`;
        logStream.insertAdjacentHTML('afterbegin', logItem);
        
        setTimeout(nextRound, 1500); // Чуть дольше пауза, чтобы успел прочитать
        return;
    }

    if (result.isCorrect) {
        feedback.innerText = "ОТЛИЧНЫЙ ВЫСТРЕЛ!";
        feedback.style.color = "#00ffcc";
    } else {
        feedback.innerText = "ПРОМАХ! СИСТЕМНЫЙ СБОЙ!";
        feedback.style.color = "#ff0055";
    }

    const logItem = `<div>[${new Date().toLocaleTimeString()}] Триада ${result.key}: ${result.logMessage}</div>`;
    logStream.insertAdjacentHTML('afterbegin', logItem);

    setTimeout(nextRound, 800);
}

// Переключение Паузы
function togglePause() {
    const newState = !engine.isPaused;
    engine.setPause(newState);

    if (newState) {
        pauseBtn.innerText = "ПРОДОЛЖИТЬ ХОД";
        pauseBtn.style.background = "#ffaa00";
        questionBox.innerText = "⏸️ МОСТИК НА ПАУЗЕ";
        answerInput.style.display = 'none'; // Скрываем ввод, чтобы не подглядывать
    } else {
        pauseBtn.innerText = "ПАУЗА";
        pauseBtn.style.background = "#4af626";
        nextRound();
    }
}

submitBtn.addEventListener('click', processAnswer);
pauseBtn.addEventListener('click', togglePause);

answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') processAnswer();
});

// Глобальный перехват клавиши Пробел для паузы
window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && document.activeElement !== answerInput) {
        e.preventDefault();
        togglePause();
    }
});

nextRound();

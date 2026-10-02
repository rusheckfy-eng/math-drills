// main.js - Связующий контроллер интерфейса
import { AdaptiveEngine } from './AdaptiveEngine.js';

// Инициализируем ядро
const engine = new AdaptiveEngine("Командор_Лео");

// Захватываем элементы DOM
const questionBox = document.getElementById('question-box');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const feedback = document.getElementById('feedback');
const matrixBody = document.getElementById('matrix-body');
const logStream = document.getElementById('log-stream');
const sessionInfo = document.getElementById('session-info');

function renderProfileData() {
    // Вывод информации о состоянии сессии
    sessionInfo.innerHTML = `Пилот: <strong>${engine.profile.name}</strong> | Операция: <strong style="color:#00ffcc">${engine.profile.mode.toUpperCase()}</strong> | Макс. число: <strong>${engine.profile.maxUnlockedNumber}</strong>`;

    // Отрисовка таблицы матрицы знаний
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
    const question = engine.generateNextQuestion();
    if (question) {
        questionBox.innerText = question.text;
        answerInput.value = '';
        answerInput.focus();
    } else {
        questionBox.innerText = "Миссия завершена! 100% Автоматизм!";
    }
    renderProfileData();
}

function processAnswer() {
    const value = answerInput.value.trim();
    if (!value) return;

    const result = engine.submitAnswer(value);
    
    // Мгновенный фидбек на экране
    if (result.isCorrect) {
        feedback.innerText = "ОТЛИЧНЫЙ ВЫСТРЕЛ!";
        feedback.style.color = "#00ffcc";
    } else {
        feedback.innerText = "ПРОМАХ! СИСТЕМНЫЙ СБОЙ!";
        feedback.style.color = "#ff0055";
    }

    // Вывод лога в отладочный блок
    const logItem = `<div>[${new Date().toLocaleTimeString()}] Триада ${result.key}: ${result.logMessage}</div>`;
    logStream.insertAdjacentHTML('afterbegin', logItem);

    // Пауза 800мс, чтобы ребенок зафиксировал результат, и переход к новому примеру
    setTimeout(nextRound, 800);
}

// Подписка на события
submitBtn.addEventListener('click', processAnswer);
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') processAnswer();
});

// Первая сборка и старт игры
nextRound();

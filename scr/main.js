// src/main.js
import { AdaptiveEngine } from './AdaptiveEngine.js';
import { NovelEngine } from './NovelEngine.js';
import { Scenario } from './Scenario.js';
import { ViewProfile } from './ViewProfile.js';
import { ViewNovel } from './ViewNovel.js';

let mathEngine = null;
let novelEngine = null;
let watchDogInterval = null;

let mathBlockActive = false;
let mathAnswersTarget = 0;
let mathAnswersCurrent = 0;

const viewProfile = new ViewProfile(handleLoginSuccess);
// Из параметров вызова ViewNovel удален обработчик смены темы
const viewNovel = new ViewNovel(handleNextNovelStep, handleUserAnswer, handleLogout);

viewProfile.render();

// Проверка автовхода
const savedSession = localStorage.getItem('math_drill_active_session');
if (savedSession) {
    handleLoginSuccess({ ...JSON.parse(savedSession), remember: true });
} else {
    viewProfile.show(true);
}

function handleLoginSuccess({ name, gender, suit, remember }) {
    viewProfile.show(false);

    // Запуск математического ядра с передачей новых параметров кастомизации
    mathEngine = new AdaptiveEngine(name);
    if (!localStorage.getItem(mathEngine.storageKey)) {
        mathEngine.profile = mathEngine.createNewProfile(name, 3, gender, suit);
        mathEngine.saveProfile();
    }

    novelEngine = new NovelEngine(Scenario);

    if (remember) {
        localStorage.setItem('math_drill_active_session', JSON.stringify({ 
            name: mathEngine.profile.name, 
            gender: mathEngine.profile.gender, 
            suit: mathEngine.profile.suit 
        }));
    }

    viewNovel.show(true);
    viewNovel.renderProfileInfo(mathEngine.profile.name);
    
    // Запуск первой сцены
    processStep(novelEngine.startScene("scene_001"));
}

function handleNextNovelStep() {
    if (mathBlockActive) return;
    processStep(novelEngine.nextStep());
}

function processStep(step) {
    if (!step) return;

    if (step.type === "scene_end") {
        if (step.nextScene) {
            processStep(novelEngine.startScene(step.nextScene));
        } else {
            viewNovel.updateQuestion("Миссия завершена! Сверхзвуковой резонанс активирован!");
        }
        return;
    }

    // АВТОМАТИЧЕСКАЯ УСТАНОВКА ЦВЕТА ВИЗОРА ИЗ НАСТРОЕК СЦЕНЫ
    const currentSceneData = Scenario[novelEngine.currentSceneId];
    if (currentSceneData && currentSceneData.theme) {
        viewNovel.applySceneTheme(currentSceneData.theme);
    }

    const heroConfig = {
        name: mathEngine.profile.name,
        gender: mathEngine.profile.gender,
        suit: mathEngine.profile.suit
    };

    if (step.type === "dialogue") {
        mathBlockActive = false;
        viewNovel.renderDialogue(step, heroConfig);
        if (step.audio) novelEngine.playAudio(step.audio);
    } 
    
    else if (step.type === "profile_lock") {
        if (mathEngine.profile.name === "Тестовый Командор") {
            novelEngine.stopAudio();
            viewNovel.show(false);
            viewProfile.show(true);
        } else {
            processStep(novelEngine.nextStep());
        }
    }

    else if (step.type === "math_block") {
        mathBlockActive = true;
        mathAnswersTarget = step.requiredCount;
        mathAnswersCurrent = 0;
        
        if (step.maxDigits && mathEngine.profile.maxUnlockedNumber !== step.maxDigits) {
            mathEngine.profile.maxUnlockedNumber = step.maxDigits;
            mathEngine.syncUnlockStates(mathEngine.profile, step.maxDigits);
        }

        mathEngine.setPause(false);
        viewNovel.showMathMode(mathAnswersTarget - mathAnswersCurrent);
        startWatchDog();
        nextMathRound();
    }
}

function nextMathRound() {
    if (!mathEngine || mathEngine.isPaused) return;
    viewNovel.updateFeedback("", true);
    const question = mathEngine.generateNextQuestion();
    if (question) viewNovel.updateQuestion(question.text);
}

function handleUserAnswer(value) {
    if (!mathEngine || mathEngine.isPaused || !mathBlockActive) return;

    const result = mathEngine.submitAnswer(value);

    if (result.isAnomaly) {
        triggerAutoPauseAction();
        return;
    }

    if (result.isCorrect) {
        viewNovel.updateQuestion("🚀 ВЕЛИКОЛЕПНО!");
        viewNovel.updateFeedback("", true); 
        mathAnswersCurrent++;
    } else {
        viewNovel.updateQuestion("💥 ПРОМАХ!");
        viewNovel.updateFeedback("", false);
        viewNovel.triggerShake();
    }

    viewNovel.updateMathProgress(mathAnswersTarget - mathAnswersCurrent);

    setTimeout(() => {
        if (mathAnswersCurrent >= mathAnswersTarget) {
            mathBlockActive = false;
            mathEngine.setPause(true);
            stopWatchDog();
            handleNextNovelStep();
        } else {
            nextMathRound();
        }
    }, 1000);
}

function triggerAutoPauseAction() {
    stopWatchDog();
    if (mathEngine) mathEngine.setPause(true);
    viewNovel.updateQuestion("⏸️ АВТОПАУЗА: ВЫ ОТВЛЕКЛИСЬ");
}

function startWatchDog() {
    stopWatchDog();
    watchDogInterval = setInterval(() => {
        if (mathEngine && !mathEngine.isPaused && mathEngine.startTime > 0) {
            const currentElapsed = performance.now() - mathEngine.startTime;
            if (currentElapsed > mathEngine.profile.config.ANOMALY_LIMIT) {
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

function handleLogout() {
    stopWatchDog();
    if (mathEngine) mathEngine.setPause(true);
    novelEngine?.stopAudio();
    localStorage.removeItem('math_drill_active_session');
    mathEngine = null;
    novelEngine = null;
    viewNovel.show(false);
    viewProfile.show(true);
}

window.addEventListener('keydown', (e) => {
    if (!mathEngine || !mathBlockActive) return;
    let numInt = parseInt(e.key);
    if (!isNaN(numInt) && numInt >= 0 && numInt <= 10) {
        handleUserAnswer(e.key);
    }
});

import { Config } from './Config.js';

export class AdaptiveEngine {
    constructor(commanderName = "Тестовый Командор") {
        this.storageKey = `math_orbit_core_${commanderName}`;
        this.profile = this.loadOrCreateProfile(commanderName);
        this.currentQuestion = null;
        this.startTime = 0;
        this.isPaused = true; 
        this.hasStartedBefore = false; 
    }

    loadOrCreateProfile(name, initialMaxDigits = 3, avatar = "scout", theme = "theme-azure") {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);
        return this.createNewProfile(name, initialMaxDigits, avatar, theme);
    }

    createNewProfile(name, initialMaxDigits, avatar, theme) {
        const maxDigits = parseInt(initialMaxDigits);
        const userConfig = { ...Config.DEFAULT };
        
        const profile = {
            name: name,
            avatar: avatar,
            theme: theme,
            maxUnlockedNumber: maxDigits, 
            mode: "addition",     
            config: userConfig,
            matrix: Config.generateMatrixUntil(5, userConfig) 
        };

        this.syncUnlockStates(profile, maxDigits);
        return profile;
    }

    saveProfile() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    }

    syncUnlockStates(profile, maxLimit) {
        Object.keys(profile.matrix).forEach(key => {
            const [sum] = key.split('_').map(Number);
            if (sum <= maxLimit) {
                profile.matrix[key].unlocked = true;
            }
        });
    }

    setPause(state) {
        this.isPaused = state;
        if (state) this.currentQuestion = null;
    }

    generateNextQuestion() {
        if (this.isPaused) return null;
        this.checkProgression();

        const pool = Object.keys(this.profile.matrix).filter(key => this.profile.matrix[key].unlocked);
        if (pool.length === 0) return null;

        pool.sort((a, b) => this.profile.matrix[b].ema - this.profile.matrix[a].ema);
        const targetIdx = Math.floor(Math.random() * Math.min(2, pool.length));
        const chosenKey = pool[targetIdx];
        
        const [sum, addend1, addend2] = chosenKey.split('_').map(Number);
        let text, correctAnswer;
        const coinFlip = Math.random() > 0.5;

        if (this.profile.mode === "addition") {
            const n1 = coinFlip ? addend1 : addend2;
            const n2 = coinFlip ? addend2 : addend1;
            text = `${n1} + ${n2} = ?`;
            correctAnswer = sum;
        } else {
            const sub = coinFlip ? addend1 : addend2;
            const res = coinFlip ? addend2 : addend1;
            text = `${sum} - ${sub} = ?`;
            correctAnswer = res;
        }

        this.currentQuestion = { key: chosenKey, text: text, answer: correctAnswer };
        this.startTime = performance.now();
        return this.currentQuestion;
    }

    submitAnswer(userAnswer) {
        if (this.isPaused || !this.currentQuestion) return { isAnomaly: false, isCorrect: false };

        const timeSpent = performance.now() - this.startTime;
        const node = this.profile.matrix[this.currentQuestion.key];
        const cfg = this.profile.config;

        if (timeSpent > cfg.ANOMALY_LIMIT) {
            this.setPause(true);
            return { 
                isAnomaly: true, 
                isCorrect: false, 
                logMessage: `Автопауза: ответ занял ${(timeSpent/1000).toFixed(1)}с. Пример аннулирован.` 
            };
        }

        const isCorrect = parseInt(userAnswer) === this.currentQuestion.answer;
        node.total++;
        let logMessage = "";

        if (isCorrect) {
            const oldEma = node.ema;
            node.ema = (timeSpent * cfg.ALPHA) + (oldEma * (1 - cfg.ALPHA));
            logMessage = `Верно за ${(timeSpent/1000).toFixed(2)}с. ЕМА: ${(node.ema/1000).toFixed(2)}с`;

            if (node.ema < cfg.AUTO_LIMIT && node.total >= 3) {
                node.mastered = true;
            }
        } else {
            node.ema += cfg.PENALTY_TIME;
            node.mastered = false;
            logMessage = `Ошибка! Штраф +${cfg.PENALTY_TIME/1000}с. ЕМА: ${(node.ema/1000).toFixed(2)}с`;
        }

        this.saveProfile();
        return { isAnomaly: false, isCorrect, timeSpent, logMessage, key: this.currentQuestion.key };
    }

    checkProgression() {
        const matrix = this.profile.matrix;
        const unlockedKeys = Object.keys(matrix).filter(k => matrix[k].unlocked);
        const allMastered = unlockedKeys.every(k => matrix[k].mastered);

        if (allMastered) {
            if (this.profile.mode === "addition") {
                if (this.profile.maxUnlockedNumber < 5) {
                    this.profile.maxUnlockedNumber++;
                    this.syncUnlockStates(this.profile, this.profile.maxUnlockedNumber);
                } else {
                    this.profile.mode = "subtraction";
                    Object.keys(matrix).forEach(k => matrix[k].mastered = false);
                }
                this.saveProfile();
            }
        }
    }
}

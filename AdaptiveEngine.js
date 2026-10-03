// AdaptiveEngine.js - Ядро с поддержкой динамических настроек отладки

export class AdaptiveEngine {
    constructor(commanderName = "Тестовый Командор") {
        this.storageKey = `math_orbit_core_${commanderName}`;
        this.ALPHA = 0.4; // Чувствительность формулы EMA
        
        // Значения по умолчанию, которые перезапишутся настройками с панели
        this.AUTO_LIMIT = 1200;    
        this.PENALTY_TIME = 1500;  
        this.ANOMALY_LIMIT = 7000; 
        
        this.profile = this.loadOrCreateProfile(commanderName);
        this.currentQuestion = null;
        this.startTime = 0;
        this.isPaused = false;
        this.pauseTimeOffset = 0;  
        this.pauseStartTime = 0;
    }

    loadOrCreateProfile(name, initialMaxDigits = 3) {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Если профиль старый, а мы поменяли настройки диапазона на панели, обновим его
            return parsed;
        }

        return this.createNewProfile(name, initialMaxDigits);
    }

    createNewProfile(name, initialMaxDigits) {
        const profile = {
            name: name,
            maxUnlockedNumber: parseInt(initialMaxDigits), 
            mode: "addition",     
            matrix: {
                "2_1_1": { total: 0, ema: 2000, mastered: false, unlocked: false },
                "3_1_2": { total: 0, ema: 2500, mastered: false, unlocked: false },
                "4_1_3": { total: 0, ema: 3000, mastered: false, unlocked: false },
                "4_2_2": { total: 0, ema: 3000, mastered: false, unlocked: false },
                "5_1_4": { total: 0, ema: 3500, mastered: false, unlocked: false },
                "5_2_3": { total: 0, ema: 3500, mastered: false, unlocked: false }
            }
        };

        // Разблокируем триады в зависимости от стартового выбора (например, до 3)
        Object.keys(profile.matrix).forEach(key => {
            const [sum] = key.split('_').map(Number);
            if (sum <= profile.maxUnlockedNumber) {
                profile.matrix[key].unlocked = true;
            }
        });

        return profile;
    }

    saveProfile() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    }

    setPause(state) {
        this.isPaused = state;
        if (state) {
            this.pauseStartTime = performance.now();
        } else {
            this.pauseTimeOffset += (performance.now() - this.pauseStartTime);
        }
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

        this.currentQuestion = {
            key: chosenKey,
            text: text,
            answer: correctAnswer
        };

        this.startTime = performance.now();
        this.pauseTimeOffset = 0;
        return this.currentQuestion;
    }

    submitAnswer(userAnswer) {
        if (this.isPaused) return { isAnomaly: false, isCorrect: false };

        const timeSpent = performance.now() - this.startTime - this.pauseTimeOffset;
        const node = this.profile.matrix[this.currentQuestion.key];

        if (timeSpent > this.ANOMALY_LIMIT) {
            return { 
                isAnomaly: true, 
                isCorrect: false, 
                timeSpent, 
                logMessage: `Ребенок отвлекся (${(timeSpent/1000).toFixed(1)}с). Сброс примера без штрафа.` 
            };
        }

        const isCorrect = parseInt(userAnswer) === this.currentQuestion.answer;
        node.total++;
        let logMessage = "";

        if (isCorrect) {
            const oldEma = node.ema;
            node.ema = (timeSpent * this.ALPHA) + (oldEma * (1 - this.ALPHA));
            logMessage = `Верно за ${(timeSpent/1000).toFixed(2)}с. ЕМА стало: ${(node.ema/1000).toFixed(2)}с`;

            if (node.ema < this.AUTO_LIMIT && node.total >= 3) {
                node.mastered = true;
            }
        } else {
            node.ema += this.PENALTY_TIME;
            node.mastered = false;
            logMessage = `Ошибка! Штраф +${this.PENALTY_TIME/1000}с. ЕМА стало: ${(node.ema/1000).toFixed(2)}с`;
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
                    this.unlockTier(this.profile.maxUnlockedNumber);
                } else {
                    this.profile.mode = "subtraction";
                    Object.keys(matrix).forEach(k => matrix[k].mastered = false);
                }
                this.saveProfile();
            }
        }
    }

    unlockTier(maxNumber) {
        Object.keys(this.profile.matrix).forEach(key => {
            const [sum] = key.split('_').map(Number);
            if (sum === maxNumber) this.profile.matrix[key].unlocked = true;
        });
    }
}

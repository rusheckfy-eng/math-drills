// AdaptiveEngine.js - Адаптивное ядро обучения с фильтром отвлечений

export class AdaptiveEngine {
    constructor(commanderName = "Тестовый Командор") {
        this.storageKey = `math_orbit_core_${commanderName}`;
        this.ALPHA = 0.4;          // Вес нового ответа в формуле EMA
        this.AUTO_LIMIT = 1200;    // Порог автоматизации (1.2 сек)
        this.PENALTY_TIME = 1500;  // Штрафное время за ошибку (1.5 сек)
        this.ANOMALY_LIMIT = 7000; // 7 секунд. Если дольше — значит ребенок отвлекся!
        
        this.profile = this.loadOrCreateProfile(commanderName);
        this.currentQuestion = null;
        this.startTime = 0;
        this.isPaused = false;
        this.pauseTimeOffset = 0;  // Для учета времени, проведенного на паузе
        this.pauseStartTime = 0;
    }

    loadOrCreateProfile(name) {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);

        return {
            name: name,
            maxUnlockedNumber: 2,
            mode: "addition",
            matrix: {
                "2_1_1": { total: 0, ema: 2000, mastered: false, unlocked: true },
                "3_1_2": { total: 0, ema: 2500, mastered: false, unlocked: false },
                "4_1_3": { total: 0, ema: 3000, mastered: false, unlocked: false },
                "4_2_2": { total: 0, ema: 3000, mastered: false, unlocked: false },
                "5_1_4": { total: 0, ema: 3500, mastered: false, unlocked: false },
                "5_2_3": { total: 0, ema: 3500, mastered: false, unlocked: false }
            }
        };
    }

    saveProfile() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    }

    // Поставить на паузу
    setPause(state) {
        this.isPaused = state;
        if (state) {
            this.pauseStartTime = performance.now();
        } else {
            // Вычитаем время, проведенное на паузе, чтобы таймер решения не пострадал
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
            answer: correctAnswer,
            sum: sum
        };

        this.startTime = performance.now();
        this.pauseTimeOffset = 0; // Сбрасываем смещение паузы для нового примера
        return this.currentQuestion;
    }

    submitAnswer(userAnswer) {
        if (this.isPaused) return { isAnomaly: false, isCorrect: false };

        // Чистое время решения = Текущее время - Время старта - Время на паузе
        const timeSpent = performance.now() - this.startTime - this.pauseTimeOffset;
        const node = this.profile.matrix[this.currentQuestion.key];

        // МЕТОДИЧЕСКИЙ ФИЛЬТР: Ребенок отвлекся
        if (timeSpent > this.ANOMALY_LIMIT) {
            return { 
                isAnomaly: true, 
                isCorrect: false, 
                timeSpent, 
                logMessage: `Игнорирование: слишком долгий ответ (${(timeSpent/1000).toFixed(1)}с). Данные не сохранены.` 
            };
        }

        const isCorrect = parseInt(userAnswer) === this.currentQuestion.answer;
        node.total++;
        let logMessage = "";

        if (isCorrect) {
            const oldEma = node.ema;
            node.ema = (timeSpent * this.ALPHA) + (oldEma * (1 - this.ALPHA));
            logMessage = `Верно за ${(timeSpent/1000).toFixed(2)}с. Новое EMA: ${(node.ema/1000).toFixed(2)}с`;

            if (node.ema < this.AUTO_LIMIT && node.total >= 3) {
                node.mastered = true;
            }
        } else {
            node.ema += this.PENALTY_TIME;
            node.mastered = false;
            logMessage = `Ошибка! Штраф +${this.PENALTY_TIME/1000}с. Новое EMA: ${(node.ema/1000).toFixed(2)}с`;
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

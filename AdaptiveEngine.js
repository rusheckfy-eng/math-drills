// AdaptiveEngine.js - Изолированное ядро адаптивного обучения

export class AdaptiveEngine {
    constructor(commanderName = "Тестовый Командор") {
        this.storageKey = `math_orbit_core_${commanderName}`;
        this.ALPHA = 0.4;          // Вес нового ответа в формуле EMA (чувствительность)
        this.AUTO_LIMIT = 1200;    // Порог автоматизации (1.2 секунды)
        this.PENALTY_TIME = 1500;  // Штрафное время за ошибку в мс
        this.START_EMA = 3500;     // Стартовое базовое время
        
        this.profile = this.loadOrCreateProfile(commanderName);
        this.currentQuestion = null;
        this.startTime = 0;
    }

    // Инициализация профиля и матрицы состава чисел 1-5
    loadOrCreateProfile(name) {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) return JSON.parse(saved);

        return {
            name: name,
            maxUnlockedNumber: 2, // Старт с состава чисел до 2 (1+1)
            mode: "addition",     // Начальный режим: "addition" или "subtraction"
            matrix: {
                // Ключ: Сумма_СлагаемоеМеньшее_СлагаемоеБольшее
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

    // Генерация примера на основе текущей сложности и проблемных зон
    generateNextQuestion() {
        this.checkProgression();

        // Берем только открытые триады
        const pool = Object.keys(this.profile.matrix).filter(key => this.profile.matrix[key].unlocked);
        if (pool.length === 0) return null;

        // Сортируем: примеры с худшим (большим) временем EMA идут вверх
        pool.sort((a, b) => this.profile.matrix[b].ema - this.profile.matrix[a].ema);
        
        // Выбираем случайный из топ-2 самых «сложных» на данный момент
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
        return this.currentQuestion;
    }

    // Фиксация ответа и пересчет по формуле EMA
    submitAnswer(userAnswer) {
        const timeSpent = performance.now() - this.startTime;
        const isCorrect = parseInt(userAnswer) === this.currentQuestion.answer;
        const node = this.profile.matrix[this.currentQuestion.key];

        node.total++;
        let logMessage = "";

        if (isCorrect) {
            const oldEma = node.ema;
            // Экспоненциальное среднее
            node.ema = (timeSpent * this.ALPHA) + (oldEma * (1 - this.ALPHA));
            logMessage = `Верно за ${(timeSpent/1000).toFixed(2)}с. Новое EMA: ${(node.ema/1000).toFixed(2)}с`;

            if (node.ema < this.AUTO_LIMIT && node.total >= 3) {
                node.mastered = true;
            }
        } else {
            // Штраф к таймеру за ошибку, чтобы пример чаще возвращался
            node.ema += this.PENALTY_TIME;
            node.mastered = false;
            logMessage = `Ошибка! Штраф +${this.PENALTY_TIME/1000}с. Новое EMA: ${(node.ema/1000).toFixed(2)}с`;
        }

        this.saveProfile();
        return { isCorrect, timeSpent, logMessage, key: this.currentQuestion.key };
    }

    // Контроль открытия уровней (состава чисел) и смены режимов операции
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
                    // Переключаемся на вычитание, когда всё сложение 1-5 автоматизировано
                    this.profile.mode = "subtraction";
                    Object.keys(matrix).forEach(k => matrix[k].mastered = false);
                }
                this.saveProfile();
            } else {
                console.log("Все режимы автоматизированы!");
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

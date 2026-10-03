// Config.js - Полная выгрузка всех инженерных и методических настроек

export const Config = {
    // Внутренние лимиты времени (в миллисекундах)
    AUTO_LIMIT: 1200,      // Порог автоматизации навыка (< 1.2 сек)
    ANOMALY_LIMIT: 10000,  // Время до Автопаузы (10 сек)
    PENALTY_TIME: 1500,    // Штраф времени к рейтингу EMA за ошибку
    
    // Настройки раунда и формулы EMA
    ROUND_DELAY: 1000,     // Пауза между примерами (1 сек)
    ALPHA: 0.4,            // Чувствительность формулы EMA (вес нового ответа)

    // МЕТОДИЧЕСКИЕ НАСТРОЙКИ СТАРТОВОГО ВРЕМЕНИ
    BASE_START_TIME: 2000, // Минимальный стартовый кредит времени (мс) для состава числа 1
    SUM_MULTIPLIER: 300,   // Сколько миллисекунд добавляется за каждую единицу суммы

    // Генератор триад состава чисел от 1 до указанного maxNum (включая 0)
    generateMatrixUntil(maxNum) {
        const matrix = {};
        for (let sum = 1; sum <= maxNum; sum++) {
            for (let a1 = 0; a1 <= Math.floor(sum / 2); a1++) {
                let a2 = sum - a1;
                const key = `${sum}_${a1}_${a2}`;
                
                // Используем динамические коэффициенты из конфига!
                const baseEma = this.BASE_START_TIME + (sum * this.SUM_MULTIPLIER); 

                matrix[key] = {
                    total: 0,
                    ema: baseEma,
                    mastered: false,
                    unlocked: false
                };
            }
        }
        return matrix;
    },

    // Метод обновления конфига из интерфейса панели отладки
    update(newSettings) {
        if (newSettings.autoLimit) this.AUTO_LIMIT = parseInt(newSettings.autoLimit);
        if (newSettings.anomalyLimit) this.ANOMALY_LIMIT = parseInt(newSettings.anomalyLimit);
        if (newSettings.penaltyTime) this.PENALTY_TIME = parseInt(newSettings.penaltyTime);
        if (newSettings.alpha) this.ALPHA = parseFloat(newSettings.alpha);
        if (newSettings.baseStartTime) this.BASE_START_TIME = parseInt(newSettings.baseStartTime);
        if (newSettings.sumMultiplier) this.SUM_MULTIPLIER = parseInt(newSettings.sumMultiplier);
    }
};

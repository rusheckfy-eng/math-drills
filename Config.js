export const Config = {
    // Дефолтные настройки для создания новых профилей
    DEFAULT: {
        AUTO_LIMIT: 1200,      
        ANOMALY_LIMIT: 10000,  
        PENALTY_TIME: 1500,    
        ROUND_DELAY: 1000,     
        ALPHA: 0.4,            
        BASE_START_TIME: 2000, 
        SUM_MULTIPLIER: 300,   
    },

    generateMatrixUntil(maxNum, config = Config.DEFAULT) {
        const matrix = {};
        for (let sum = 1; sum <= maxNum; sum++) {
            for (let a1 = 0; a1 <= Math.floor(sum / 2); a1++) {
                let a2 = sum - a1;
                const key = `${sum}_${a1}_${a2}`;
                const baseEma = config.BASE_START_TIME + (sum * config.SUM_MULTIPLIER); 

                matrix[key] = {
                    total: 0,
                    ema: baseEma,
                    mastered: false,
                    unlocked: false
                };
            }
        }
        return matrix;
    }
};

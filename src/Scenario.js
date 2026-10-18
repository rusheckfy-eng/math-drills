// src/Scenario.js

export const Scenario = {
    "scene_001": {
        title: "Пробуждение в каюте и вызов И.С.К.Р.Ы.",
        theme: "theme-azure", // Лазурный неон Академии Земли
        timeline: [
            {
                type: "dialogue",
                speaker: "Система",
                text: "* Пип... Пип... Пип... Входящий зашифрованный канал связи... *",
                leftChar: null,
                rightChar: null
            },
            {
                type: "dialogue",
                speaker: "И.С.К.Р.А.",
                text: "Семь ноль-ноль по уставу Земли! Приём! Эй, Капитан, ты где? Твой бортовой ИИ уже устал стучаться по радиоканалу!",
                leftChar: null,
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "Командор",
                text: "Не шуми, Искорка! Я уже на ногах и застёгиваю последнюю липучку на ботинке.",
                leftChar: null,
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "И.С.К.Р.А.",
                text: "Наш перехватчик «Стрела-Икс» в ангаре уже заждался! Двигатели прогреты, варианты маршрутов посчитаны! А ты всё ещё возишься!!",
                leftChar: null,
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "Командор",
                text: "Спокойно, мы взлетим точно по секундомеру. Сегодня наш первый настоящий вылет, нужно выглядеть круто!",
                leftChar: { id: "hero", pose: "suit_hello" }, // Появляется наша красная девочка
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "И.С.К.Р.А.",
                text: "Ого! Яркий красный цвет? Решила ослепить Третий флот Федерации ещё до выхода из гиперпространства?",
                leftChar: { id: "hero", pose: "suit_hello" },
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "Командор",
                text: "В сером пусть летают роботы-уборщики. Включаю предвзлётную диагностику систем курьера!",
                leftChar: { id: "hero", pose: "suit_hello" },
                rightChar: { id: "iskra", pose: "normal" }
            },
            {
                type: "dialogue",
                speaker: "И.С.К.Р.А.",
                text: "Внимание! Квантовый терминал заблокирован защитным протоколом. Командор, реши тренировочные уравнения для синхронизации визора шлема!",
                leftChar: { id: "hero", pose: "suit_hello" },
                rightChar: { id: "iskra", pose: "normal" }
            },
            
            // ТРЕНИРОВОЧНЫЙ МАТЕМАТИЧЕСКИЙ БЛОК (Сложение и вычитание в пределах 5)
            {
                type: "math_block",
                requiredCount: 3, // Сколько примеров нужно решить для продолжения
                maxDigits: 5      // Автоматическое ограничение математической матрицы (числа до 5)
            },
            
            // РЕПЛИКИ ПОСЛЕ УСПЕШНОГО РЕШЕНИЯ ТРЕНИРОВКИ
            {
                type: "dialogue",
                speaker: "И.С.К.Р.А.",
                text: "Диагностика завершена! Квантовый реактор стабилен на 100%. Мы готовы покинуть каюту и направиться в ангар!",
                leftChar: { id: "hero", pose: "suit_hello" },
                rightChar: { id: "iskra", pose: "normal" }
            }
        ],
        nextScene: "scene_002" // Ссылка на следующую сцену (пока пустая)
    }
};

// src/Scenario.js

export const Scenario = {
    "scene_001": {
        title: "Пробуждение в каюте и вызов И.С.К.Р.Ы.",
        theme: "theme-azure", // Лазурный неон для стартовой локации Земли
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
                rightChar: { id: "iskra", pose: "normal" } // Голограмма Искры появляется справа у пульта
            },
            {
                type: "dialogue",
                speaker: "Командор", // View автоматически заменит на имя игрока
                text: "Не шуми, Искорка! Я уже на ногах и застёгиваю последнюю липучку на ботинке.",
                leftChar: null, // Пилот отвечает из-за кадра, завязывая обувь
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
                leftChar: { id: "hero", pose: "suit_hello" }, // Пилот появляется слева на переднем плане
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
                text: "В сером пусть летают роботы-уборщики. Погнали в ангар!",
                leftChar: { id: "hero", pose: "suit_hello" },
                rightChar: { id: "iskra", pose: "normal" }
            }
        ],
        nextScene: "scene_002" // Переход в ангар к Жоре
    }
};

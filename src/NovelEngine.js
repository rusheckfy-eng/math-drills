// src/NovelEngine.js

export class NovelEngine {
    constructor(scenarioData) {
        this.scenario = scenarioData;
        this.currentSceneId = null; // Хранит строку вида "scene_001"
        this.currentIndex = 0;      // Индекс текущего шага в timeline
        this.currentAudio = null;
    }

    startScene(sceneId) {
        if (!this.scenario[sceneId]) {
            console.error(`Сцена ${sceneId} отсутствует в глобальном плане.`);
            return null;
        }
        this.currentSceneId = sceneId;
        this.currentIndex = 0;
        this.stopAudio();
        return this.getCurrentStep();
    }

    getCurrentStep() {
        const scene = this.scenario[this.currentSceneId];
        if (!scene || this.currentIndex >= scene.timeline.length) {
            return { type: "scene_end", nextScene: scene?.nextScene || null };
        }

        const step = scene.timeline[this.currentIndex];
        
        // 1. АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ ПУТЕЙ К ФОНАМ В ФОРМАТЕ .WEBP
        const bgPath = `assets/backgrounds/${this.currentSceneId}.webp`;
        
        // 2. УМНАЯ ЗАГЛУШКА ДЛЯ АУДИО (Убирает спам ошибками 404 в консоли)
        // Путь генерируется только если в шаге сценария явно прописано "hasAudio: true"
        let audioPath = null;
        if (step.type === "dialogue" && step.hasAudio === true) {
            const lineNum = String(this.currentIndex + 1).padStart(3, '0');
            audioPath = `assets/audio/${this.currentSceneId}/line_${lineNum}.mp3`;
        }

        return {
            ...step,
            background: bgPath,
            audio: audioPath
        };
    }

    nextStep() {
        this.currentIndex++;
        this.stopAudio();
        return this.getCurrentStep();
    }

    playAudio(audioSrc) {
        this.stopAudio();
        if (!audioSrc) return;
        
        this.currentAudio = new Audio(audioSrc);
        this.currentAudio.play().catch(err => {
            // Мягкий отлов блокировок автоплея браузерами
            console.warn("Озвучка реплики заблокирована политикой браузера:", err.message);
        });
    }

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
}

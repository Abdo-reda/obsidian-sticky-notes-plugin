export class LoggingService {
    private static isEnabled = false;

    static enable() {
        this.isEnabled = true;
    }

    static disable() {
        this.isEnabled = false;
    }

    static info(message: string, ...args: unknown[]) {
        if (!this.isEnabled) return;
        console.log(`[sticky-notes-plugin]: ${message}`, ...args);
    }

    static warn(message: string, ...args: unknown[]) {
        if (!this.isEnabled) return;
        console.warn(`[sticky-notes-plugin]: ${message}`, ...args);
    }

    static error(message: string, ...args: unknown[]) {
        if (!this.isEnabled) return;
        console.error(`[sticky-notes-plugin]: ${message}`, ...args);
    }
}
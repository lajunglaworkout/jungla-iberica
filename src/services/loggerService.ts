import { supabase } from '../lib/supabase';

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';

export interface LogEntry {
    level: LogLevel;
    module: string;
    message: string;
    meta?: Record<string, unknown>;
    timestamp: number;
}

class LoggerService {
    private static instance: LoggerService;
    private logBuffer: LogEntry[] = [];
    private readonly FLUSH_INTERVAL = 10000; // 10 seconds
    private readonly BATCH_SIZE = 10;
    private flushTimer: NodeJS.Timeout | null = null;
    private isProcessing = false;

    private constructor() {
        // Start auto-flush timer
        this.startFlushTimer();

        // Listen for unload to flush remaining logs
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.flush(true);
            });
        }
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    private startFlushTimer() {
        if (this.flushTimer) clearInterval(this.flushTimer);
        this.flushTimer = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
    }

    /**
     * Log an info message
     */
    public info(module: string, message: string, meta?: Record<string, unknown>) {
        this.addLog('info', module, message, meta);
    }

    /**
     * Log a warning message
     */
    public warn(module: string, message: string, meta?: Record<string, unknown>) {
        this.addLog('warning', module, message, meta);
    }

    /**
     * Log an error message
     */
    public error(module: string, message: string, meta?: Record<string, unknown>) {
        console.error(`[Guard] ${module}: ${message}`, meta); // Always console error strictly for local debugging
        this.addLog('error', module, message, meta);
    }

    /**
     * Log a critical error message
     */
    public critical(module: string, message: string, meta?: Record<string, unknown>) {
        this.addLog('critical', module, message, meta);
        // Critical errors trigger immediate flush
        this.flush();
    }

    private addLog(level: LogLevel, module: string, message: string, meta?: Record<string, unknown>) {
        const entry: LogEntry = {
            level,
            module,
            message,
            meta,
            timestamp: Date.now()
        };

        this.logBuffer.push(entry);

        if (this.logBuffer.length >= this.BATCH_SIZE) {
            this.flush();
        }
    }

    private async flush(isUrgent = false) {
        if (this.logBuffer.length === 0 || (this.isProcessing && !isUrgent)) return;

        this.isProcessing = true;
        const batch = [...this.logBuffer];
        this.logBuffer = []; // Clear buffer immediately

        try {
            // Get current user info if possible
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            const dbRows = batch.map(log => ({
                level: log.level,
                module: log.module,
                message: log.message,
                meta: log.meta ? JSON.stringify(log.meta) : {},
                user_id: user?.id || null,
                user_email: user?.email || null,
                created_at: new Date(log.timestamp).toISOString()
            }));

            // Non-blocking insert using fetch if unload (beacon) or standard Supabase otherwise
            // Ideally we use Supabase client but for unload reliability we might need beacon, 
            // keeping it simple with supabase client for now.

            const { error } = await supabase.from('system_logs').insert(dbRows);

            if (error) {
                // Fallback: print to console if we can't save to DB
                console.error('Failed to flush system logs to DB', error);
            }
        } catch (err) {
            console.error('Critical failure in LoggerService', err);
        } finally {
            this.isProcessing = false;
        }
    }
}

export const logger = LoggerService.getInstance();

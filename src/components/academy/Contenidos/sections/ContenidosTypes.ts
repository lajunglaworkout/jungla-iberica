import { AcademyLesson } from '../../../../types/academy';

export interface ContenidosViewProps {
    onBack: () => void;
}

export interface LessonBlock {
    id: string;
    lesson_id: string;
    block_number: number;
    title: string;
    content?: string;
    file_url?: string;
    duration?: number;
    // New fields Phase 6
    main_ideas?: string;
    key_points?: string;
    full_content?: string;
    genspark_prompt?: string;
    video_url?: string;
    ppt_url?: string;
    production_status?: 'not_started' | 'content_created' | 'prompts_ready' | 'recording' | 'editing' | 'completed';
    progress_percentage?: number;
    downloadables?: Record<string, unknown>[];
    // Strategic Guide Fields
    concepto?: string;
    valor?: string;
    accion?: string;
}

export interface EditingDownloadable {
    id: string;
    name: string;
    prompt_generation: string;
}

export type ActiveModalField = 'none' | 'prompt' | 'points' | 'content';
export type LessonSortMode = 'order' | 'completed' | 'pending';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

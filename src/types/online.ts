export type OnlineTaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type OnlineTaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface OnlineTask {
    id: string;
    title: string;
    description?: string;
    assigned_to: string[]; // Array of names
    due_date?: string;
    priority: OnlineTaskPriority;
    status: OnlineTaskStatus;
    origin?: string;
    created_at: string;
    completed_at?: string;
    notes?: string;
    dependencies?: string[];
}

export type ContentLevel = 'specific' | 'common';
export type ContentCategory = 'exercise' | 'community' | 'viral' | 'feedback';
export type ContentStatus = 'idea' | 'script' | 'recording' | 'editing' | 'ready' | 'published';

export interface OnlineContent {
    id: string;
    display_id?: string;
    title: string;
    level: ContentLevel;
    buyer_persona?: string;
    category?: ContentCategory;
    subcategory?: string;
    description?: string;
    duration?: number;
    status: ContentStatus;
    producer?: string;
    editor?: string;
    video_url?: string;
    materials_url?: string;
    locations?: string[];
    people?: string[];
    objective?: string;
    cta?: string;
    gym_compatible: boolean;
    platforms?: string[];
    scheduled_date?: string;
    recording_date?: string;
    editing_date?: string;
    notes?: string;
    tags?: string[];
    created_at: string;
}

export type CalendarStatus = 'scheduled' | 'published' | 'cancelled';

export interface OnlineCalendarEvent {
    id: string;
    content_id?: string;
    platform: string;
    profile?: string;
    status: CalendarStatus;
    scheduled_at: string;
    caption?: string;
    hashtags?: string;
    url?: string;
    metrics?: {
        reach?: number;
        engagement?: number;
        shares?: number;
    };
    notes?: string;
    created_at: string;
    // Joined fields
    content?: OnlineContent;
}

export type IdeaPriority = 'high' | 'medium' | 'low';
export type IdeaStatus = 'new' | 'evaluating' | 'approved' | 'discarded';

export interface OnlineIdea {
    id: string;
    title: string;
    description?: string;
    category?: string;
    priority: IdeaPriority;
    suggested_by?: string;
    status: IdeaStatus;
    is_completed: boolean;
    notes?: string;
    created_at: string;
}

export type ClientStatus = 'active' | 'paused' | 'cancelled';

export interface OnlineClient {
    id: string;
    harbiz_id?: string;
    full_name: string;
    email?: string;
    join_date?: string;
    plan?: string;
    status: ClientStatus;
    next_payment_date?: string;
    last_connection?: string;
    total_paid?: number;
    payment_method?: string;
    origin?: string;
    notes?: string;
    created_at: string;
}

export interface OnlineMetric {
    id: string;
    type: 'content' | 'team' | 'financial';
    period_start?: string;
    period_end?: string;
    data: Record<string, unknown>;
    created_at: string;
}

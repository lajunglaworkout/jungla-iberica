export type AcademyRole = 'CEO' | 'DIRECTOR';

export type ModuleStatus = 'planned' | 'in_progress' | 'completed';
export type LessonStatus = 'planned' | 'scripted' | 'recorded' | 'completed';
export type FileType = 'video' | 'ppt' | 'downloadable' | 'script';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TutorAvailability = 'available' | 'limited' | 'unavailable';
export type PartnerStatus = 'active' | 'inactive';
export type CohorteStatus = 'planned' | 'enrollment' | 'in_progress' | 'completed';
export type CohorteModality = 'online' | 'complete' | 'mixed';
export type StudentStatus = 'active' | 'completed' | 'abandoned';
export type CompanyCategory = 'pequeña' | 'mediana' | 'grande';
export type CompanyStatus = 'pending' | 'paid' | 'active' | 'expired';
export type TransactionType = 'income' | 'expense';
export type TransactionCategory = 'curso_online' | 'curso_completo' | 'empresa' | 'tutor' | 'partner_center' | 'plataforma' | 'marketing' | 'otros';

export interface AcademyModule {
    id: string;
    title: string;
    order: number;
    responsible_id?: string;
    status: ModuleStatus;
    description?: string;
    created_at: string;
}

export interface AcademyLesson {
    id: string;
    module_id: string;
    title: string;
    order: number;
    duration?: number;
    video_url?: string;
    ppt_url?: string;
    script_url?: string;
    has_test: boolean;
    status: LessonStatus;
    created_at: string;
}

export interface AcademyLessonFile {
    id: string;
    lesson_id: string;
    file_type: FileType;
    file_name: string;
    file_url: string;
    uploaded_at: string;
}

export type ProductionStatus =
    | 'not_started'
    | 'content_created'
    | 'prompts_ready'
    | 'recording'
    | 'editing'
    | 'completed';

export interface AcademyLessonBlock {
    id: string;
    lesson_id: string;
    block_number: 1 | 2 | 3;
    title: string;
    description?: string;
    duration?: number;
    // New fields Phase 6
    main_ideas?: string;
    key_points?: string;
    full_content?: string;
    genspark_prompt?: string;
    video_url?: string;
    ppt_url?: string;
    production_status?: ProductionStatus;
    progress_percentage?: number;
    downloadables?: AcademyBlockDownloadable[];
}

export interface AcademyBlockDownloadable {
    id: string;
    block_id: string;
    name: string;
    type: 'pdf' | 'excel' | 'word' | 'image';
    prompt_generation?: string;
    file_url?: string;
    status: 'pending' | 'generated' | 'uploaded';
    order: number;
    created_at: string;
}

export interface AcademyTask {
    id: string;
    title: string;
    description?: string;
    assigned_to?: string;
    created_by?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    progress: number;
    module_related?: string;
    lesson_related?: string;
    block_related?: string; // New field for block context
    completed_at?: string;
    created_at: string;
}

export type SharedContentType = 'prompt' | 'guide' | 'resource';

export interface AcademySharedContent {
    id: string;
    title: string;
    content: string;
    type: SharedContentType;
    category?: string;
    tags?: string[];
    created_at: string;
    created_by?: string;
    is_public: boolean;
}

export interface AcademyTutor {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    center_id?: string;
    city?: string;
    specialties?: string[];
    availability: TutorAvailability;
    compensation_rate: number;
    notes?: string;
    created_at: string;
}

export interface AcademyPartnerCenter {
    id: string;
    name: string;
    city: string;
    address?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    compensation_per_student: number;
    agreement_date?: string;
    status: PartnerStatus;
    notes?: string;
    created_at: string;
}

export interface AcademyCohorte {
    id: string;
    name: string;
    city: string;
    center_id?: string;
    partner_center_id?: string;
    start_date: string;
    end_date?: string;
    max_students: number;
    enrolled_students: number;
    status: CohorteStatus;
    modality: CohorteModality;
    notes?: string;
    created_at: string;
}

export interface AcademyStudentCache {
    id: string;
    external_id?: string;
    name?: string;
    email?: string;
    cohorte_id?: string;
    modality?: 'online' | 'complete';
    enrollment_date?: string;
    status?: StudentStatus;
    progress_percentage: number;
    tutor_id?: string;
    satisfaction_rating?: number;
    last_synced?: string;
}

export interface AcademyCompanyCache {
    id: string;
    external_id?: string;
    name?: string;
    city?: string;
    category?: CompanyCategory;
    contact_name?: string;
    contact_email?: string;
    status?: CompanyStatus;
    amount_paid?: number;
    request_date?: string;
    last_synced?: string;
}

export interface AcademyTransaction {
    id: string;
    date: string;
    concept: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    student_id?: string;
    tutor_id?: string;
    partner_center_id?: string;
    cohorte_id?: string;
    notes?: string;
    synced_from_academy: boolean;
    created_at: string;
}

export interface AcademyKPIs {
    ingresos_mes_actual: number;
    alumnos_activos: number;
    proximos_cursos: number;
    satisfaccion_promedio: number;
}

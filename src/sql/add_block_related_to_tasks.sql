-- Add block_related column to academy_tasks
ALTER TABLE academy_tasks 
ADD COLUMN IF NOT EXISTS block_related UUID;

COMMENT ON COLUMN academy_tasks.block_related IS 'UUID of the specific content block (academy_lesson_blocks) this task is related to';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_academy_tasks_block_related ON academy_tasks(block_related);

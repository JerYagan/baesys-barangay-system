-- ALTER TABLE residents TO ADD digital_id_status FOR ID REQUEST FLOW
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS digital_id_status VARCHAR(20) DEFAULT 'not_requested';

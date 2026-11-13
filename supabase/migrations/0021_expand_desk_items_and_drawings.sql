-- Migration 0021: Expand desk_documents item_type CHECK & allow float stroke width in desk_drawings

ALTER TABLE public.desk_documents
    DROP CONSTRAINT IF EXISTS desk_documents_item_type_check;

ALTER TABLE public.desk_documents
    ADD CONSTRAINT desk_documents_item_type_check
    CHECK (item_type IN ('paper', 'book', 'exam_sheet', 'sticky_note', 'roadmap', 'code_block', 'mind_map', 'sticker'));

ALTER TABLE public.desk_drawings
    ALTER COLUMN width TYPE DOUBLE PRECISION;

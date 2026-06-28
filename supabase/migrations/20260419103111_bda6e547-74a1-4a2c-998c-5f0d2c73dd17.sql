CREATE TABLE public.document_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT document_analyses_user_type_unique UNIQUE (user_id, document_type)
);

ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document analyses"
ON public.document_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document analyses"
ON public.document_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document analyses"
ON public.document_analyses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document analyses"
ON public.document_analyses FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_document_analyses_updated_at
BEFORE UPDATE ON public.document_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_document_analyses_user_id ON public.document_analyses(user_id);
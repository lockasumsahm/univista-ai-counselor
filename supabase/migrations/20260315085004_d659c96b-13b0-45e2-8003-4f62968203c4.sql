
-- Create factor_scores table to persist AI breakdown per user per university
CREATE TABLE public.factor_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  university_name TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  category TEXT,
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  document_boost JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, university_name)
);

-- Enable RLS
ALTER TABLE public.factor_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own scores" ON public.factor_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scores" ON public.factor_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scores" ON public.factor_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scores" ON public.factor_scores FOR DELETE USING (auth.uid() = user_id);

-- Add country-specific fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS a_level_grades TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS predicted_grades TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gaokao_score TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_exam_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_exam_score TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS baccalaureate_score TEXT;

-- Trigger for updated_at on factor_scores
CREATE TRIGGER update_factor_scores_updated_at
  BEFORE UPDATE ON public.factor_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

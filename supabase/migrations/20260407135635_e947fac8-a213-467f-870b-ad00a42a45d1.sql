
-- Create user_programs table for Program Tracker persistence
CREATE TABLE public.user_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university text NOT NULL,
  program text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'researching',
  priority text NOT NULL DEFAULT 'match',
  country text NOT NULL DEFAULT '',
  tuition text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own programs" ON public.user_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own programs" ON public.user_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own programs" ON public.user_programs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own programs" ON public.user_programs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON public.user_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_deadlines table for Deadline Tracker persistence
CREATE TABLE public.user_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university text NOT NULL,
  type text NOT NULL DEFAULT 'custom',
  date text NOT NULL,
  notes text NOT NULL DEFAULT '',
  completed boolean NOT NULL DEFAULT false,
  reminder boolean NOT NULL DEFAULT true,
  reminder_days jsonb NOT NULL DEFAULT '[7, 3, 1]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deadlines" ON public.user_deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deadlines" ON public.user_deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deadlines" ON public.user_deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deadlines" ON public.user_deadlines FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_deadlines_updated_at BEFORE UPDATE ON public.user_deadlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_applications table for Application Progress persistence
CREATE TABLE public.user_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  university_name text NOT NULL,
  deadline text NOT NULL DEFAULT '',
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" ON public.user_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own applications" ON public.user_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.user_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON public.user_applications FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_applications_updated_at BEFORE UPDATE ON public.user_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

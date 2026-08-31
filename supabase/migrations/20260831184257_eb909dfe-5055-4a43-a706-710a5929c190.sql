CREATE TABLE public.projects (
  id serial PRIMARY KEY,
  code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL,
  year integer NOT NULL,
  sort_order integer NOT NULL,
  use_cases text[] NOT NULL DEFAULT '{}',
  url text,
  preview_image text,
  video_url text,
  icon_image text,
  position_x double precision,
  position_y double precision
);

GRANT SELECT ON public.projects TO anon, authenticated;
GRANT UPDATE (position_x, position_y) ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.projects_id_seq TO service_role;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Projects are publicly viewable"
  ON public.projects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can rearrange the desktop"
  ON public.projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.projects (code, title, description, category, status, year, sort_order, use_cases, url, preview_image, video_url, icon_image)
VALUES
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,1,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,2,'{}',NULL,NULL,NULL,NULL),
  ('BC','Business Card','Paper business cards are boring. Using an NFC enabled card and Replit I made mine digital.','Growth','Live',2026,3,ARRAY['Digitalise sharing my contact details','Create a wow factor whilst doing so'],'https://example.com/business-card','business-card-preview.png',NULL,'business-card-avatar.png'),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,4,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,5,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,6,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,7,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,8,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,9,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,10,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,11,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,12,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,13,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,14,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,15,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,16,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,17,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,18,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,19,'{}',NULL,NULL,NULL,NULL),
  ('CS','Coming Soon','This build is still in the garage. Check back soon.','Agentic AI','Coming Soon',2026,20,'{}',NULL,NULL,NULL,NULL);
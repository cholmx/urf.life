CREATE OR REPLACE FUNCTION public.sermon_text_to_paragraphs(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO ''
AS $function$
  SELECT coalesce(string_agg('<p>' || p || '</p>', '' ORDER BY n), '')
  FROM (
    SELECT trim(t.p) AS p, t.n
    FROM regexp_split_to_table(coalesce(input, ''), '\n+') WITH ORDINALITY AS t(p, n)
  ) s
  WHERE p <> '';
$function$;

REVOKE EXECUTE ON FUNCTION public.sermon_text_to_paragraphs(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.split_sermon_description(description text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
declare
lower_desc text;
summary_pos int;
questions_pos int;
summary_text text := '';
questions_text text := '';
begin
if description is null or trim(description) = '' then
return jsonb_build_object('summary', '', 'discussion_questions', '');
end if;

lower_desc := lower(description);
summary_pos := position('summary:' in lower_desc);
questions_pos := position('discussion questions:' in lower_desc);

if summary_pos > 0 then
if questions_pos > summary_pos then
summary_text := substring(description from summary_pos + length('summary:') for questions_pos - summary_pos - length('summary:'));
else
summary_text := substring(description from summary_pos + length('summary:'));
end if;
summary_text := regexp_replace(summary_text, 'Watch the full message.*$', '', 'i');
end if;

if questions_pos > 0 then
questions_text := substring(description from questions_pos + length('discussion questions:'));
questions_text := regexp_replace(questions_text, '(URF WEBSITE|SOCIALS:).*$', '', 'i');
end if;

return jsonb_build_object(
'summary', public.sermon_text_to_paragraphs(summary_text),
'discussion_questions', public.sermon_text_to_paragraphs(questions_text)
);
end;
$function$;

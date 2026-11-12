-- Lets the admin "Tag Untagged Sermons" button call ai_tag_untagged_sermons()
-- directly via supabase.rpc(). Two changes from the original pg_cron-only
-- version: it now returns how many sermons it tagged (so the button can
-- show a real count instead of a generic "done"), and authenticated users
-- are granted EXECUTE on it (functions aren't callable over PostgREST
-- without an explicit grant).

drop function if exists ai_tag_untagged_sermons(int);

create or replace function ai_tag_untagged_sermons(batch_size int default 10)
returns int
language plpgsql
security definer
set search_path = public, extensions, net, vault
as $$
declare
  anthropic_key text;
  sermon record;
  request_id bigint;
  resp record;
  response_body jsonb;
  tool_input jsonb;
  tags_array text[];
  tagged_count int := 0;
begin
  select decrypted_secret into anthropic_key
  from vault.decrypted_secrets
  where name = 'anthropic_api_key'
  limit 1;

  if anthropic_key is null then
    raise warning 'ai_tag_untagged_sermons: no anthropic_api_key secret in Vault yet - run select vault.create_secret(''your-key'', ''anthropic_api_key''); once, then this will start working.';
    return 0;
  end if;

  for sermon in
    select id, title, summary, discussion_questions
    from sermons_portal123
    where (tags is null or array_length(tags, 1) is null)
    order by sermon_date desc
    limit batch_size
  loop
    select net.http_post(
      url := 'https://api.anthropic.com/v1/messages',
      headers := jsonb_build_object(
        'x-api-key', anthropic_key,
        'anthropic-version', '2023-06-01',
        'content-type', 'application/json'
      ),
      body := jsonb_build_object(
        'model', 'claude-sonnet-5-5',
        'max_tokens', 512,
        'system', 'You tag church sermons for a website. Given a sermon''s title, summary, and discussion questions, call the sermon_tags tool with 3-6 short topical tags (1-3 words each, title case, e.g. "Forgiveness", "The Holy Spirit") describing what it is actually about.',
        'messages', jsonb_build_array(
          jsonb_build_object(
            'role', 'user',
            'content', 'Title: ' || coalesce(sermon.title, '') ||
                       E'\n\nSummary: ' || coalesce(regexp_replace(sermon.summary, '<[^>]*>', ' ', 'g'), '') ||
                       E'\n\nDiscussion Questions: ' || coalesce(regexp_replace(sermon.discussion_questions, '<[^>]*>', ' ', 'g'), '')
          )
        ),
        'tools', jsonb_build_array(
          jsonb_build_object(
            'name', 'sermon_tags',
            'description', 'The topical tags for this sermon.',
            'input_schema', jsonb_build_object(
              'type', 'object',
              'properties', jsonb_build_object(
                'tags', jsonb_build_object('type', 'array', 'items', jsonb_build_object('type', 'string'))
              ),
              'required', jsonb_build_array('tags'),
              'additionalProperties', false
            ),
            'strict', true
          )
        ),
        'tool_choice', jsonb_build_object('type', 'auto')
      ),
      timeout_milliseconds := 30000
    ) into request_id;

    select * into resp from net_wait_response(request_id, 60, 0.5);

    if resp.status_code is null or resp.status_code >= 300 then
      raise warning 'ai_tag_untagged_sermons: request failed for sermon % - status % - %', sermon.id, resp.status_code, coalesce(resp.error_msg, 'no error message');
      continue;
    end if;

    begin
      response_body := resp.content::jsonb;
    exception when others then
      raise warning 'ai_tag_untagged_sermons: could not parse response as JSON for sermon %', sermon.id;
      continue;
    end;

    if response_body->>'stop_reason' = 'refusal' then
      raise warning 'ai_tag_untagged_sermons: Claude declined for sermon %', sermon.id;
      continue;
    end if;

    select content_block->'input' into tool_input
    from jsonb_array_elements(response_body->'content') as content_block
    where content_block->>'type' = 'tool_use' and content_block->>'name' = 'sermon_tags'
    limit 1;

    if tool_input is null then
      raise warning 'ai_tag_untagged_sermons: no sermon_tags tool call in response for sermon %', sermon.id;
      continue;
    end if;

    select array_agg(value) into tags_array
    from jsonb_array_elements_text(tool_input->'tags') as value;

    update sermons_portal123 set tags = coalesce(tags_array, '{}') where id = sermon.id;
    tagged_count := tagged_count + 1;
  end loop;

  raise notice 'ai_tag_untagged_sermons: tagged % sermon(s)', tagged_count;
  return tagged_count;
end;
$$;

grant execute on function ai_tag_untagged_sermons(int) to authenticated;

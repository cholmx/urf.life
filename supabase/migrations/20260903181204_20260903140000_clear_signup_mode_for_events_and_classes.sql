UPDATE staff_announcements_portal123
SET signup_mode = 'none'
WHERE happening_type IN ('event', 'class')
  AND signup_mode <> 'none';
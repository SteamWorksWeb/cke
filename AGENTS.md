<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:blog-publishing-rules -->
# Blog Publishing Checklist

Every time a new blog post MDX file is created, you MUST complete ALL of the following steps before considering the task done — without being asked:

1. **Image conversion**: If a featured image is provided in a non-WebP format, run `npm run convert` immediately. This converts the image to WebP, deletes the original, and the MDX frontmatter must point to the `.webp` path.

2. **Date ordering**: The `date` field in frontmatter MUST be set to today's date (YYYY-MM-DD format) so the post sorts as the newest on the home page and category pages. Verify it is lexicographically greater than the previous most-recent post date.

3. **Category accuracy**: Confirm the `categories` array matches only the valid site categories: Entertainment, Tech, Sports, Outdoors, Finance, Web Design, Funny, Life.

4. **Home page visibility**: Posts are sorted newest-first by `date` (or `datetime`). A new post with today's date will automatically appear first on the home page. No code changes are needed — just ensure the date is correct.

5. **Category page visibility**: Posts appear on category pages filtered by their `categories` array. Verify the categories in the frontmatter are spelled correctly and match the valid list above.

6. **Commit and push**: After creating the MDX file, ALWAYS run `git add -A`, then `git commit`, then `git push` to deploy the post. Do not leave the post uncommitted.

7. **Confirm**: After pushing, confirm to the user that the post has been committed and pushed, and that Vercel will rebuild automatically.
<!-- END:blog-publishing-rules -->

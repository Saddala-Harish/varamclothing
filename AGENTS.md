<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Store architecture
- Catalogue, settings and orders live in Lovable Cloud tables; order placement goes through the `place_order` database function so prices/stock are recomputed server-side and stock is decremented atomically.
- Product images may be full URLs or `stitch:N` placeholder keys resolved via `src/lib/stitch-images.ts`, so seed data stays short and owners can paste real URLs in admin.
- Store details (WhatsApp, delivery charges, payment options, policies) come from the single-row `store_settings` table, never hardcoded in UI.
- The first account to sign up becomes admin (DB trigger); admin is a client-only route checking `has_role`, with RLS as the real boundary.

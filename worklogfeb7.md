# SimuLearntion – Work Log (Feb 7, 2026)

## Gameplay & UI
- Added **floating joystick** for mobile movement.
- Added **fullscreen button** for mobile.
- Added **player interaction popup**: click another player → “Message”.
- Added **chat close/toggle** + **emoji picker** + **shortcode replacement**.
- Added **profanity filter** (basic list; replaces with `***`).
- **Tutorial scenes**: typewriter text, speech balloons, Next/Previous buttons (removed auto-advance).
- Added **Tutorial button** in lobby to replay onboarding.
- **Quiz**: topic selection (5 questions per topic), tap-to-submit, moved answer boxes, fixed green preselect bug, fixed back prompt logic.
- **Chiggy & Paru NPCs**: proximity dialog, auto-close, collision blocking, scaled to 0.12, Chiggy moved left 96px.
- Dialogs use **typewriter effect** and **pixel-like font**.

## Achievements Overhaul
- Replaced achievements with new set + icons:
  - `freshman`, `engaged_rookie`, `seasoned_learner`, `physicist`, `an_enthusiast`, `trailblazer`.
- **Trailblazer** is the default title and awarded after tutorial completion.
- Achievements UI uses **image icons**; dimmed if locked.
- Fixed Achievements scene re-open issue (icons no longer disappear).
- Clicking an **earned achievement** sets the **player title**.
- Profile shows **latest achievement icon** (scale 0.10).

## Leveling / XP
- XP system:
  - +1 per correct answer
  - +0.2 per incorrect
  - +5 bonus for 5/5 topic
- **Erudition Level** = `floor(xp / 5) + 1`
- Level shown **above player name** (local + other players).
- **Live level updates** broadcast via socket.
- Server computes XP/level in `/api/profile` so it persists across logins.

## Sync / Backend
- New `POST /api/quiz/submit` route to save quiz attempts + check achievements.
- New `POST /api/achievements/award` for tutorial completion.
- Achievement manager updated to XP-based erudition and new rules.
- Profile now returns XP + erudition level.

## Deployment
- `deploy-vps.sh` now:
  - Sets `CLIENT_URL=https://simulearntion.sehs.online`
  - Includes Nginx + Certbot setup
  - Skips DB changes by default
  - Use `./deploy-vps.sh --db` to run migrations/db push/admin
  - Detects `docker compose` vs `docker-compose`

## Files Touched (high level)
- Client:
  - `client/js/ui/TouchControls.js`
  - `client/js/ui/ChatBox.js`
  - `client/js/scenes/QuizScene.js`
  - `client/js/scenes/LobbyScene.js`
  - `client/js/scenes/LibraryScene.js`
  - `client/js/scenes/AchieveScene.js`
  - `client/js/scenes/OnboardingScene*.js`
  - `client/js/entities/Player.js`
  - `client/js/entities/OtherPlayer.js`
  - `client/js/main.js`
  - `client/index.html`
  - `client/css/style.css`
- Shared:
  - `shared/constants.js` (new quiz + achievements)
- Server:
  - `server/routes/quiz.js` (new)
  - `server/routes/achievements.js` (new)
  - `server/routes/profile.js` (xp/level)
  - `server/utils/achievement-manager.js` (new rules)
  - `server/middleware/validation.js` (new schemas)
  - `server/server.js`
- Deployment:
  - `deploy-vps.sh`

## Notes / Next Steps
- If needed: store XP/Level in DB instead of computed.
- Optional: add UI indicator for selected title in Achievements.
- Optional: expand profanity list or add server-side filtering.

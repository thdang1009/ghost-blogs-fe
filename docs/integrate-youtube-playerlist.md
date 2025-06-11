# PRD: YouTube Playlist Player Integration for Ghost Site

## Feature Overview

Allow users to play a specific YouTube playlist directly on a Ghost blog page without needing to open YouTube. This will enable focused content consumption and reduce distractions, especially for users working in professional environments.

---

## Goals

- Embed a YouTube playlist player on a Ghost blog post or static page.
- Ensure playback works seamlessly across desktop and mobile devices.
- Maintain a clean, minimalist UI that matches the site's aesthetic.
- Allow future extension (e.g., multiple playlists, theme-aware styling).

---

## Non-goals

- No need for playlist creation or editing from within the Ghost CMS.
- No support for YouTube account integration or recommendations.

---

## User Stories

### 1. As a user,
I want to play a YouTube playlist from within the site  
So that I don’t have to open YouTube and risk distractions.

### 2. As a site owner,
I want the embedded player to match my site's design  
So that it doesn’t break the reading/watching experience.

---

## Requirements

### Functional

- [ ] Embed a YouTube playlist using iframe.
- [ ] Accept a playlist ID via a custom field, code block, or hardcoded.
- [ ] Autoplay optional (controlled by query string param).
- [ ] Display playlist in compact or full player mode.

### Non-functional

- [ ] Responsive: player should scale properly on all devices.
- [ ] Minimalist UI: no clutter around the player.
- [ ] Lightweight: avoid performance hit on page load.

---

## Technical Details

- Embed format:
  ```
  https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID
  ```

- To disable related videos after finish (keep professional):
  Add `&rel=0` to the iframe URL.

- Optional parameters:
  - `autoplay=1`
  - `modestbranding=1`
  - `showinfo=0`
  - `controls=1` or `0`

- Example iframe:
  ```
  <iframe
    width="100%"
    height="400"
    src="https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID&rel=0&modestbranding=1"
    frameborder="0"
    allow="autoplay; encrypted-media"
    allowfullscreen
  ></iframe>
  ```

---

## Milestones

1. ✅ Confirm YouTube playlist ID and test embed manually.
2. ⚙️ Create custom HTML block or helper in Ghost post/page.
3. 🎨 Style iframe to match site's theme.
4. 🚀 Optional: Add toggle to switch between compact/full player.

---

## Success Criteria

- User can play full playlist without leaving the page.
- Playback experience is smooth on both desktop and mobile.
- Player styling integrates well with the blog’s visual theme.
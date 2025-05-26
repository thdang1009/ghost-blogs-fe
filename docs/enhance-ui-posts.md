# 📝 Product Requirement Document (PRD)  
## Blog Redesign: Filterable & Scalable Post Display  

---

## 🧩 Overview

The current blog fetches all public posts and lazily displays them as the user scrolls. While this approach has yielded a high Lighthouse score, it's no longer scalable due to:

- Growing number of posts  
- Need for categorization (tags, series, etc.)  
- Admin-only (private) post visibility  
- User-friendly filtering and discovery  

This PRD proposes a redesigned frontend and backend structure to address scalability, improve UX, and retain high performance scores.

---

## 🎯 Goals

- Enable filterable content: by tags, series, most-read, etc.  
- Add private (admin-only) content access  
- Reduce API load with query-based fetching  
- Maintain high Lighthouse scores  
- Improve user experience with clearer content discovery  

---

## 📁 Features & Requirements

### 1. **API Enhancements**

Add support for query-based post fetching:

- Filter by tag, series, or read count  
- Pagination using cursor or page number  
- Optional authentication for private content  

**Example API calls:**

'''bash
GET /posts?tag=ai&limit=5  
GET /posts?sort=views&limit=5  
GET /posts?series=Tam-Quoc  
GET /posts?private=true  
'''

### 2. **Frontend UI Redesign**

#### Sections
- 🔥 Top 5 Most Read  
- 🏷️ Tag Explorer  
- 📚 Series Explorer  
- 🆕 Recent Posts  
- 🔒 Private Posts (Admin Only)  

#### Behavior
- Lazy-load content by section  
- Use "Load More" buttons instead of infinite scroll  
- Filter chips or dropdowns for tag/series navigation  
- Optional: reveal private posts when admin toggles a "Private Mode"  

---

## 💡 UX/Performance Enhancements

- Lazy loading images (`loading="lazy"`)  
- Intersection Observer to lazy-load sections  
- Skeleton loading UI  
- Prefetch data on hover (optional)  
- Cache first render sections  
- Use SWR (stale-while-revalidate) logic for critical data  

---

## 🛠 Implementation Notes

### Private Mode
- Show toggle/button only if user is authenticated as grand admin  
- Avoid fetching private content by default  

### Meta & SEO
- Update URL and metadata dynamically based on filters  
- Example: `?tag=philosophy` → update title/meta for SEO  

### Image Optimization
- Use `next/image` or similar to compress and optimize delivery  
- Serve low-res thumbnails in lists  

---

## 🔍 Non-Goals

- No WYSIWYG post editor changes  
- No change to the post creation workflow  
- No support for multi-author roles (yet)  

---

## ⏱️ Milestones

| Milestone            | Description                              | ETA      |
|----------------------|------------------------------------------|----------|
| API Query Support    | Implement filter, pagination, private access | T+3 days |
| UI Filter Sections   | Frontend components and logic            | T+7 days |
| Lighthouse Optimization | Ensure score > 90 after changes     | T+9 days |
| Admin View Toggle    | Enable private content toggle            | T+10 days|

---

## 🧪 Testing Plan

- Manual UI test: all filter types  
- API integration test: correct filters, pagination  
- Lighthouse audit: mobile and desktop  
- Admin account test: private content access only when logged in  

---

## 📈 Success Metrics

- Maintain Lighthouse score > 90  
- Page load size ≤ 500KB initially  
- Avg. API response time ≤ 300ms  
- Increase in user time-on-site and interaction with tags/filters  

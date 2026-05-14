import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { of, tap, catchError } from 'rxjs';
import { Post } from '@models/post';
import { PostService } from '@services/_index';

// Runs before PostDetailComponent renders so the post body, <title>, and
// Open Graph / Twitter meta tags are present in the initial SSR HTML.
// Crawlers and social-share unfurlers that don't execute hydration still see
// the correct preview.
export const postResolver: ResolveFn<Post | null> = route => {
  const postService = inject(PostService);
  const titleService = inject(Title);
  const meta = inject(Meta);
  const router = inject(Router);

  const ref = route.paramMap.get('ref');
  if (!ref) {
    router.navigate(['/home']);
    return of(null);
  }

  return postService.getPost(ref).pipe(
    tap(post => {
      if (!post) return;
      const subject = (post.title as string) || 'Ghost Site';
      const desc = (post.description as string) || '';
      const creator = (post.author as string) || 'Dang Trinh';
      const img = (post.postBackgroundImg as string) || '';

      titleService.setTitle(subject);
      meta.updateTag({ itemprop: 'name', content: subject });
      meta.updateTag({ itemprop: 'description', content: desc });
      meta.updateTag({ name: 'description', content: desc });
      meta.updateTag({ name: 'twitter:card', content: 'summary' });
      meta.updateTag({ name: 'twitter:title', content: subject });
      meta.updateTag({ name: 'twitter:description', content: desc });
      meta.updateTag({ name: 'twitter:creator', content: creator });
      meta.updateTag({ name: 'twitter:image', content: img });
      meta.updateTag({ property: 'og:title', content: subject });
      meta.updateTag({ property: 'og:description', content: desc });
      meta.updateTag({ property: 'og:creator', content: creator });
      meta.updateTag({ property: 'og:image', content: img });
    }),
    catchError(() => of(null))
  );
};

import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { of, tap, catchError } from 'rxjs';
import { Post } from '@models/post';
import { PostService } from '@services/_index';
import { SeoService } from '@services/seo/seo.service';

// Runs before PostDetailComponent renders so the post body, <title>, and
// Open Graph / Twitter meta tags are present in the initial SSR HTML.
// Crawlers and social-share unfurlers that don't execute hydration still see
// the correct preview.
export const postResolver: ResolveFn<Post | null> = route => {
  const postService = inject(PostService);
  const seo = inject(SeoService);
  const router = inject(Router);

  const ref = route.paramMap.get('ref');
  if (!ref) {
    router.navigate(['/home']);
    return of(null);
  }

  return postService.getPost(ref).pipe(
    tap(post => {
      if (!post) return;
      seo.setBlogTags(post);
    }),
    catchError(() => of(null))
  );
};

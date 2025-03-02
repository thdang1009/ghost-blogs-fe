import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '@services/_index';
import { Router } from '@angular/router';
import { Title, Meta } from "@angular/platform-browser";
import { POST_TYPE } from '@shared/enum';
import { Post } from '@models/post';
@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {

  ready = false;
  item!: Post;
  idDebounce: any = undefined;
  POST_TYPE = POST_TYPE;
  num = 0;
  count: Number = 0;
  constructor(
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private meta: Meta) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('ref');
    this.postService.getPost(id as string).subscribe(post => {
      this.item = post;
      this.count = post.clapCount || 0;
      this.ready = true;
      const subject = post.title as string;
      const desc = post.description as string;
      const creator = post.author as string;
      const img = post.postBackgroundImg as string;
      this.titleService.setTitle(post.title as string);
      this.meta.updateTag({ itemprop: 'name', content: subject });
      this.meta.updateTag({ itemprop: 'description', content: desc });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
      this.meta.updateTag({ name: 'twitter:title', content: subject });
      this.meta.updateTag({ name: 'twitter:description', content: desc });
      this.meta.updateTag({ name: 'twitter:creator', content: creator });
      this.meta.updateTag({ name: 'twitter:image', content: img });
      this.meta.updateTag({ property: 'og:title', content: subject });
      this.meta.updateTag({ property: 'og:description', content: desc });
      this.meta.updateTag({ property: 'og:creator', content: creator });
      this.meta.updateTag({ property: 'og:image', content: img });
    });
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngOnDestroy(): void {
    this.meta.removeTag('itemprop="name"');
    this.meta.removeTag('itemprop="description"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:creator"');
    this.meta.removeTag('name="twitter:image"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:creator"');
    this.meta.removeTag('property="og:image"');
    this.titleService.setTitle('Ghost Site');
  }

  clapThisPost(e: any) {
    // make debounce
    this.num++;
    if (this.idDebounce) {
      clearTimeout(this.idDebounce);
    }
    this.idDebounce = setTimeout(() => {
      this.postService.clapPost(this.item, this.num)
        .subscribe(_ => {
          this.item = _;
          this.num = 0;
          this.count = _.clapCount || 0;
          clearTimeout(this.idDebounce);
        });
    }, 500);
  }

  updateClap() {
    console.log('update');
  }

  removeClap() {
    console.log('remove');
  }
  imgClick() {

  }
  backToHome() {
    this.router.navigate(['home']);
  }
}

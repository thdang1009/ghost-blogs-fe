import { NgModule, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { PostDetailComponent } from './post/post-detail/post-detail.component';
import { SharedModule } from '@shared/shared-module.module';
import { ClipboardButtonComponent, CLIPBOARD_OPTIONS, MarkdownModule, MARKED_OPTIONS, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { ReuseComponentModule } from '@reuse/reuse.module';;
import { ComponentsModule } from '@components/components.module';
import { AnchorService } from '@shared/anchor/anchor.service';


export function markedOptionsFactory(anchorService: AnchorService): MarkedOptions {
  const renderer = new MarkedRenderer();

  // fix `href` for absolute link with fragments so that _copy-paste_ urls are correct
  renderer.link = (href: string, title: string, text: string) => {
    return MarkedRenderer.prototype.link.call(renderer, anchorService.normalizeExternalUrl(href), title, text) as string;
  };

  return { renderer };
}

@NgModule({
  declarations: [
    PostDetailComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReuseComponentModule,
    BlogRoutingModule,
    ComponentsModule,
    // third party
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MARKED_OPTIONS,
        useFactory: markedOptionsFactory,
        deps: [],
      },
      clipboardOptions: {
        provide: CLIPBOARD_OPTIONS,
        useValue: {
          buttonComponent: ClipboardButtonComponent,
        },
      },
      sanitize: SecurityContext.NONE,
    }),
  ]
})
export class BlogManagementModule { }

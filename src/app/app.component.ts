import { Component, OnInit } from '@angular/core';
import { ThirdPartyLoaderService } from './services/third-party/third-party-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'ghost-blogs-fe';

  constructor(private thirdPartyLoader: ThirdPartyLoaderService) {}

  ngOnInit(): void {
    // Initialize third-party scripts with lazy loading
    this.thirdPartyLoader.initializeThirdPartyScripts();
  }
}

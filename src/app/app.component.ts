import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertModule } from '@components/alert/alert.module';
import { ThirdPartyLoaderService } from './services/third-party/third-party-loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertModule],
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

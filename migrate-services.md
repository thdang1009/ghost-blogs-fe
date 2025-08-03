# API Service Migration Guide

This guide shows how to migrate all services to use the new `ApiConfigService` for proper SSR/Browser API URL handling.

## Migration Pattern

For each service that uses `environment.apiUrl`, follow this pattern:

### 1. Update imports
```typescript
// REMOVE
import { environment } from '@environments/environment';
const apiUrl = environment.apiUrl + '/v1/[endpoint]';

// ADD
import { ApiConfigService } from '@services/api-config/api-config.service';
```

### 2. Update service class
```typescript
@Injectable({
  providedIn: 'root'
})
export class YourService {
  // ADD this getter
  private get apiUrl(): string {
    return this.apiConfigService.getApiUrl('/v1/[endpoint]');
  }

  constructor(
    private http: HttpClient,
    // ADD this dependency
    private apiConfigService: ApiConfigService
  ) { }
```

### 3. Update all apiUrl references
Replace all instances of the old `apiUrl` constant with `this.apiUrl`.

## Services that need migration

Based on grep results, these services need to be updated:
- ✅ PostService (completed)
- ✅ AuthService (completed) 
- ✅ CategoryService (completed)
- ✅ UserService (completed)
- TagService
- SeriesService
- FileService
- BookService
- NoteService
- JournalService
- MoodService
- TodoTodayService
- GuestMessageService
- ConfigService
- AnalyticsService
- SystemService
- AwsService
- RewardService
- CouponService
- SearchService
- TodoLabelService

## How the new system works

### Phase 1: Server-Side Rendering (SSR)
- When Angular renders on the server, `isPlatformServer()` returns true
- API calls use `http://localhost:3000` for fastest local communication
- No CORS issues since it's server-to-server communication

### Phase 2: Client-Side (Browser)
- When Angular hydrates in the browser, `isPlatformBrowser()` returns true  
- API calls use the correct domain (`https://dangtrinh.site/api` in production)
- Seamless transition from SSR to client-side rendering

This ensures optimal performance during SSR while maintaining correct API communication in the browser.
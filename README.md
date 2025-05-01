# Ghost Blog Platform - Frontend

A modern, feature-rich blog platform built with Angular. This project provides a responsive, user-friendly interface for content creation, management, and consumption.

## Features

- Responsive blog interface with modern design
- Admin dashboard for content management
- Authentication with JWT and Google OAuth
- Markdown support for content creation
- Real-time search functionality
- Category and tag organization
- File upload and management
- User management with role-based access
- Analytics integration with Google Analytics
- Server-side rendering (SSR) for improved SEO

## Tech Stack

- **Framework**: Angular 18
- **UI Components**: Angular Material, Bootstrap Material Design
- **State Management**: Angular Signals and RxJS
- **Styling**: SCSS
- **Markdown**: ngx-markdown with syntax highlighting
- **Analytics**: ngx-google-analytics
- **HTTP**: Angular HttpClient with interceptors
- **Routing**: Angular Router with lazy loading
- **Testing**: Jasmine and Karma

## Prerequisites

- Node.js 18.x
- npm 8.x+
- Angular CLI 18.x

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ghost-blog-platform.git
cd ghost-blogs-fe
```

2. Install dependencies
```bash
npm install
```

3. Configure environment
   - Create a copy of `src/environments/environment.ts` as `environment.ts`
   - Update API URL, Google Analytics code, and other settings

4. Start the development server
```bash
npm start
```
Navigate to `http://localhost:4500/` to see the application in action.

## Project Structure

```
ghost-blogs-fe/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── guards/         # Route guards
│   │   ├── helpers/        # Helper functions and utilities
│   │   ├── layouts/        # Page layouts (admin, guest)
│   │   ├── models/         # TypeScript interfaces and models
│   │   ├── pages/          # Page components
│   │   ├── pipes/          # Custom Angular pipes
│   │   ├── services/       # API services and business logic
│   │   └── shared/         # Shared modules and components
│   ├── assets/             # Static assets (images, icons)
│   ├── environments/       # Environment configuration
│   └── styles/             # Global styles and themes
├── .github/workflows/      # CI/CD pipelines
└── server.ts               # Server-side rendering setup
```

## Key Components

- **Layouts**: 
  - `AdminLayoutComponent`: Dashboard for content management
  - `GuestLayoutComponent`: Public-facing blog layout

- **Services**:
  - `AuthService`: Handles authentication
  - `PostService`: Manages blog posts
  - `SearchService`: Provides search functionality
  - `FileService`: Handles file uploads and management
  - `AnalyticsService`: Tracks user interactions

- **Feature Modules**:
  - Blog module for post viewing and creation
  - User management module
  - File management module
  - Analytics module

## Building and Deployment

### Development Build
```bash
npm run build
```

### Production Build with SSR
```bash
npm run build --configuration=production
```

### Serving SSR Locally
```bash
npm run serve:ssr:ghost-blogs-fe
```

### CI/CD Pipeline

The project includes a GitHub Actions workflow for automatic deployment to AWS EC2:

1. Push changes to the main branch
2. GitHub Actions builds the application with SSR
3. The build artifacts are deployed to EC2 via SSH
4. PM2 restarts the application

## Code Style and Best Practices

This project follows Angular's official style guide and best practices:

- Properly typed interfaces for all data models
- Lazy-loaded feature modules
- Component-based architecture
- Reactive programming with RxJS
- Standalone components where appropriate
- Pure pipes for view transformations
- Clean, maintainable code with proper naming conventions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

© 2021 Dang Trinh. All Rights Reserved.

This is a personal blog project with All Rights Reserved licensing. No part of this codebase or its content may be used commercially by anyone except the copyright holder. For permissions, please contact [thdang1009@gmail.com].

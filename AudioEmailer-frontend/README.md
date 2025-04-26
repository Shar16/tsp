# AudioEmailer-frontend
## Prerequisites
- Node v22.x (LTS) - https://nodejs.org/en/download/current
- Angular CLI - https://angular.dev/tools/cli/setup-local#install-the-angular-cli
- Bun (Optional) - https://bun.sh/docs/installation#installing

## Getting Started  
Follow these steps to set up the project locally for development and testing.

### Installation  
1. **Clone the repository**  
   ```bash
   git clone https://git.shefcompsci.org.uk/com6103-2024-25/team08/project.git
   cd AudioEmailer-frontend
   ```

2. **Install dependencies**  
   Using npm:  
   ```bash
   npm install
   ```
   Using Bun:  
   ```bash
   bun install
   ```

3. **Start the development server**  
   ```bash
   ng serve
   ```
   The app will automatically reload at `http://localhost:4200` when you modify files.


## Project Structure

### Front-end
```
AudioEmailer-frontend
├── README.md
├── angular.json
├── bun.lockb
├── package.json
├── public
│   └── favicon.ico
├── src
│   ├── app
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── features
│   │   ├── auth # Authentication logic (services, components)
│   │   └── dashboard # Dashboard pages and data-fetching logic
│   │       └── dashboard.page.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── tsconfig.app.json
├── tsconfig.json
└── tsconfig.spec.json
```
- `Features/`
- `Auth/`
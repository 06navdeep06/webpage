# Creative Developer Portfolio

A modern, creative personal portfolio website for developers with unique design elements, custom animations, and GitHub API integration.

![Portfolio Preview](images/portfolio-preview.png)

## Features

- **Unique Design System**: Custom color palette, typography, and components
- **Interactive Hero Section**: Animated background with particle system
- **Skills Visualization**: Interactive skills constellation
- **GitHub Projects Integration**: Dynamic project cards from GitHub repositories
- **Custom Cursor**: Interactive cursor that reacts to hoverable elements
- **Theme Switcher**: Multiple color themes with smooth transitions
- **Responsive Design**: Optimized for all device sizes
- **Micro-interactions**: Subtle animations and hover effects
- **Contact Form**: Interactive form with validation
- **Accessibility**: ARIA attributes and keyboard navigation

## Project Structure

```
creative-portfolio/
├── css/
│   ├── globals.css       # Base styles, colors, typography
│   ├── layout.css        # Grid systems and spacing
│   ├── components.css    # UI components
│   ├── animations.css    # Animation keyframes
│   ├── themes.css        # Color themes
│   └── responsive.css    # Responsive design rules
├── js/
│   ├── cursor.js         # Custom cursor functionality
│   ├── navigation.js     # Navigation and theme switching
│   ├── hero.js           # Hero section animation
│   ├── skills.js         # Skills visualization
│   ├── projects.js       # GitHub API integration
│   ├── animations.js     # Scroll animations
│   ├── contact.js        # Form functionality
│   └── main.js           # Main initialization
├── images/               # Image assets
├── index.html            # Main HTML file
└── README.md             # Documentation
```

## Deployment Instructions

### Option 1: Deploy to Netlify

1. **Create a GitHub Repository**
   - Push your portfolio code to a new GitHub repository

2. **Set Up Environment Variables**
   - In Netlify, add the GitHub Personal Access Token as an environment variable:
     - Key: `GITHUB_PAT`
     - Value: Your GitHub Personal Access Token

3. **Deploy from GitHub**
   - Log in to [Netlify](https://www.netlify.com/)
   - Click "New site from Git"
   - Select your GitHub repository
   - Configure build settings (not required for this static site)
   - Click "Deploy site"

4. **Configure Custom Domain (Optional)**
   - In the Netlify dashboard, go to "Domain settings"
   - Add your custom domain and follow the instructions

### Option 2: Deploy to GitHub Pages

1. **Create a GitHub Repository**
   - Name it `username.github.io` (replace "username" with your GitHub username)
   - Push your portfolio code to this repository

2. **Configure GitHub Pages**
   - Go to repository settings
   - Scroll down to "GitHub Pages" section
   - Select "main" branch as the source
   - Click "Save"

3. **Add GitHub Token**
  - Since GitHub Pages doesn't support environment variables, update the `projects.js` file:
  - Replace the token retrieval with a personal access token (for public repos only)
  - Or modify the code to work without authentication for public repositories

4. **Access Your Site**
   - Your site will be available at `https://username.github.io`

## Deployment for thequazar.com

1. **DNS Setup**
   - Point `thequazar.com` via `A` records to the platform IPs you plan to use (Netlify: `75.2.60.5`, `99.83.190.102`; Vercel: `76.76.21.21`; GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).
   - Add a `CNAME` record for `www` that resolves to `thequazar.com` so the redirect stays uniform.

2. **Netlify Notes**
   - Deploy the repo (static site; no custom build step needed), add the custom domain, verify DNS, enable Automatic HTTPS, and toggle "Force HTTPS" plus "Redirect www to non-www."

3. **Vercel Notes**
   - Import the repo, choose the "Other" preset, and deploy. Add `thequazar.com` as a domain, follow SSL issuance guidance, and enable HTTPS enforcement with `www` redirecting to the apex.

4. **GitHub Pages Notes**
   - Create a `CNAME` file containing `thequazar.com` in the repo root.
   - In Pages settings, configure the custom domain, update DNS with GitHub’s records, and enable "Enforce HTTPS."

5. **HTTPS & Redirect Guidance**
   - All three platforms provision TLS automatically; keep the HTTPS enforcement and non-www redirect toggles enabled so https://thequazar.com is canonical.
   - Secrets stay in `js/env.js` generated at build time or platform env vars—don’t hardcode tokens in committed files.

### Option 3: Deploy to Vercel

1. **Create a Vercel Account**
   - Sign up at [Vercel](https://vercel.com/)

2. **Install Vercel CLI (Optional)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy via Vercel Dashboard**
   - Import your GitHub repository
   - Configure project settings
   - Add environment variables for GitHub PAT
   - Deploy

4. **Deploy via CLI (Alternative)**
   ```bash
   # Navigate to project directory
   cd creative-portfolio
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

### Option 4: Deploy to Any Static Host

1. **Prepare for Deployment**
   - Ensure all file paths are relative
   - Update GitHub token in `projects.js` if needed

2. **Upload Files**
   - Upload all files to your web hosting service
   - Ensure the directory structure is maintained

3. **Configure HTTPS (Recommended)**
   - Enable HTTPS for your domain for security

## Local Development

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd creative-portfolio
   ```

2. **Run a Local Server**
   - Using Python:
     ```bash
     # Python 3
     python -m http.server
     
     # Python 2
     python -m SimpleHTTPServer
     ```
   - Using Node.js:
     ```bash
     # Install http-server
     npm install -g http-server
     
     # Run server
     http-server
     ```

3. **Open in Browser**
   - Navigate to `http://localhost:8000` or the port shown in your terminal

## Customization

### Personal Information
- Edit the content in `index.html` to add your name, bio, and contact information
- Update social media links in the contact section

### GitHub Integration
- In `js/projects.js`, update the `githubConfig` object with your GitHub username
- Set up your GitHub Personal Access Token with `public_repo` scope
- Add featured repositories to highlight specific projects

### Custom Themes
- Add or modify themes in `css/themes.css`
- Each theme has its own color palette and style variations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

MIT License - Feel free to use, modify, and distribute this code for personal or commercial projects.

## Credits

- Font Awesome for icons
- Google Fonts for typography
- Unsplash for placeholder images

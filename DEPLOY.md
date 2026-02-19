# Quick Deployment Guide

## Option 1: Netlify (Recommended)

### 1. Push to GitHub
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/your-username/creative-portfolio.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) and sign up
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `creative-portfolio` repository
5. **Important**: Add environment variables:
   - Go to Site settings → Build & deploy → Environment
   - Add variable: `GITHUB_PAT` = your GitHub token
   - Add variable: `GITHUB_USERNAME` = your GitHub username
6. Click "Deploy site"

### 3. Custom Domain (Optional)
- In Netlify dashboard → Domain settings → Add custom domain

## Option 2: Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repository
3. Add environment variables:
   - `GITHUB_PAT`: your GitHub token
   - `GITHUB_USERNAME`: your GitHub username
4. Deploy

## Option 3: GitHub Pages

1. Rename repository to `your-username.github.io`
2. Enable GitHub Pages in repository settings
3. Select `main` branch as source
4. **Note**: GitHub Pages doesn't support environment variables, so you'll need to:
   - Either hardcode the token in `js/env.js` (not recommended)
   - Or modify `projects.js` to work without authentication for public repos

## After Deployment

- Your site will be live with your GitHub projects
- The design philosophy section will showcase your handcrafted approach
- All animations and interactions will work as designed

## Troubleshooting

- If projects don't load: Check that the GitHub token has `public_repo` scope
- If styling breaks: Ensure all CSS files are uploaded
- If animations don't work: Check browser console for JavaScript errors

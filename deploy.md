# Deployment Guide for Prayer Times React App

## Quick Deployment to Netlify

### Method 1: Drag & Drop (Fastest)

1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `build` folder to the deployment area
   - Your app will be live instantly!

### Method 2: Git-based Deployment (Recommended for production)

1. **Push to Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Prayer Times React App"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your Git provider and repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `build`
     - **Functions directory:** `netlify/functions`
   - Click "Deploy site"

### Method 3: Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=build
   ```

## Environment Variables (if needed)

If you need to add environment variables:

1. In Netlify dashboard, go to Site settings > Environment variables
2. Add any required variables
3. Redeploy the site

## Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed

## Testing the Deployment

After deployment, test these features:

- [ ] Prayer times display correctly
- [ ] Current time updates every second
- [ ] Mute/unmute button works
- [ ] Responsive design on mobile
- [ ] Prayer time notifications (wait for prayer time or test with modified times)
- [ ] API endpoint works: `https://your-site.netlify.app/.netlify/functions/prayer-times`

## Troubleshooting

### Common Issues:

1. **Functions not working:**
   - Check that `netlify.toml` is in the root directory
   - Verify functions are in `netlify/functions/` directory
   - Check function logs in Netlify dashboard

2. **Build fails:**
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility
   - Review build logs for specific errors

3. **Prayer times not loading:**
   - Check browser console for errors
   - Test the function endpoint directly
   - Verify CORS settings in `netlify.toml`

## Performance Optimization

The app is already optimized with:
- React production build
- CSS minification
- Serverless functions for API calls
- Responsive images and fonts
- Efficient re-rendering with React hooks

## Monitoring

Monitor your app's performance:
- Netlify Analytics (built-in)
- Google Analytics (add if needed)
- Netlify Function logs for API monitoring

## Updates and Maintenance

To update the app:
1. Make changes locally
2. Test with `npm run netlify:dev`
3. Push to Git (auto-deploys) or run `netlify deploy --prod`

The prayer times will automatically update as they're fetched from the external source daily.

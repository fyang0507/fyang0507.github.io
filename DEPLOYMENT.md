# Deployment Guide

This project uses GitHub Actions to automatically build and deploy the site to GitHub Pages.

## How it works

1. **Main Branch**: Contains the source code (React, TypeScript, etc.)
2. **gh-pages Branch**: Contains the built static files (automatically generated)

## Automatic Deployment

When you push to the `main` branch:

1. GitHub Actions automatically triggers the build process
2. The site is built using `npm run build`
3. The generated `docs/` folder is deployed to the `gh-pages` branch
4. GitHub Pages serves the site from the `gh-pages` branch

## Benefits of this approach

- ✅ **Clean main branch**: No auto-generated files cluttering your source code
- ✅ **No merge conflicts**: You don't need to pull auto-generated commits before pushing
- ✅ **Automatic deployment**: Just push to main and your site updates
- ✅ **Version history**: The gh-pages branch maintains a history of deployments

## Local Development

To test the build locally:

```bash
# Run the test build script
./scripts/test-build.sh

# Or manually:
npm run build
npx serve docs
```

## GitHub Pages Configuration

Make sure your repository is configured to serve GitHub Pages from the `gh-pages` branch:

1. Go to your repository settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "Deploy from a branch"
4. Choose `gh-pages` as the branch
5. Choose `/ (root)` as the folder

## Troubleshooting

If deployment fails:
1. Check the Actions tab in your GitHub repository
2. Look for any error messages in the workflow logs
3. Ensure all dependencies are properly listed in `package.json`
4. Verify the build works locally with `npm run build` 
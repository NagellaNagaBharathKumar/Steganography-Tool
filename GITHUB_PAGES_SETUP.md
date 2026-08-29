# Steganography Tool - GitHub Pages Setup Guide

## ✅ What's Been Done

Your repository has been successfully converted to work with GitHub Pages! Here's what changed:

### Files Modified/Created:

1. **index.html** - Main application (embedded CSS, no server needed)
2. **steg.js** - Pure JavaScript implementation of steganography algorithms
3. **README.md** - Updated with GitHub Pages deployment info
4. **_config.yml** - Jekyll configuration for GitHub Pages
5. **.github/workflows/deploy.yml** - Automatic deployment workflow

### What Happened to the Flask Version?

The original Flask files are still in the repository for reference:
- `app.py` (Python backend - no longer needed)
- `requirements.txt` (Python dependencies)
- `templates/` (old Flask templates)
- `run.bat` (Windows batch file)

These won't interfere with GitHub Pages.

## 🚀 Enable GitHub Pages

GitHub Pages should be automatically enabled, but let's verify:

### Manual Setup (if needed):

1. Go to your repository: https://github.com/NagellaNagaBharathKumar/Steganography-Tool

2. Click **Settings** (top right)

3. In the left sidebar, click **Pages**

4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
   - The workflow will run automatically

5. Your site will be available at:
   ```
   https://NagellaNagaBharathKumar.github.io/Steganography-Tool/
   ```

6. Visit the URL after 2-3 minutes (first deployment takes a bit longer)

## 📋 Deployment Status

- **Automatic Deployment**: ✅ Enabled via GitHub Actions
- **Branch**: `main`
- **Trigger**: Every push to main branch

Check deployment status:
1. Go to your repository
2. Click **Actions** tab
3. Look for "Deploy to GitHub Pages" workflow
4. Click the latest run to see details

## 🎯 Access Your Site

Once deployed (1-5 minutes):

```
https://NagellaNagaBharathKumar.github.io/Steganography-Tool/
```

## 🔧 How to Make Changes

Any changes pushed to the `main` branch will automatically deploy:

```bash
# Make a change
git add .
git commit -m "Update something"
git push origin main

# GitHub Actions will automatically build and deploy!
# Check the Actions tab to see deployment progress
```

## 📱 Features Working on GitHub Pages

✅ Upload images  
✅ Hide text in images  
✅ Hide files in images  
✅ Extract hidden content  
✅ Download steganographic images  
✅ Download extracted files  

**All processing happens in your browser - no server required!**

## 🔐 Privacy

- ✅ Your images never leave your device
- ✅ No server logs
- ✅ No tracking
- ✅ No account required
- ✅ Works offline (after first load)

## 🛠 Local Testing

Test locally before pushing:

```bash
# Python 3
python -m http.server 8000

# Or Node.js
npx http-server

# Visit: http://localhost:8000
```

## 📊 Traffic & Analytics

To add Google Analytics (optional):

1. Edit `_config.yml`
2. Add your tracking ID:
   ```yaml
   google_analytics: UA-XXXXXXXXX-X
   ```

## ❓ Troubleshooting

### Site not showing up
- Wait 2-5 minutes for first deployment
- Check the **Actions** tab for deployment errors
- Verify settings are correct in **Settings > Pages**

### Images not loading
- Check browser console (F12) for errors
- Ensure image format is PNG or BMP
- Try with a different image

### Feature not working
- Check browser console for JavaScript errors
- Try in a different browser
- Clear browser cache (Ctrl+Shift+Delete)

## 📝 Next Steps

1. ✅ Verify site is live at the GitHub Pages URL
2. ✅ Test encode/decode functions
3. ✅ Share the link with others
4. ✅ (Optional) Add custom domain in Settings > Pages

## 🎓 Learning Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jekyll Theme Gallery](https://pages.github.com/themes/)

## 📞 Support

If you encounter issues:

1. Check browser console (F12 > Console tab)
2. Verify all files are committed and pushed
3. Wait for GitHub Actions workflow to complete
4. Check GitHub Pages settings

---

**Your Steganography Tool is now live on GitHub Pages!** 🎉

Visit: https://NagellaNagaBharathKumar.github.io/Steganography-Tool/

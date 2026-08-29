# Steganography Tool - GitHub Pages Edition

A pure client-side steganography tool that works entirely in the browser without requiring any backend server. This version is optimized for GitHub Pages hosting.

## Features

✅ **Encode**: Hide text or files inside images using LSB steganography  
✅ **Decode**: Extract hidden content from steganographic images  
✅ **No Backend Required**: All processing happens in your browser  
✅ **GitHub Pages Hosted**: Deploy instantly on GitHub Pages  
✅ **Privacy**: Your images never leave your device  
✅ **Support for PNG/BMP**: Lossless formats recommended  

## Live Demo

🚀 **Access it here**: [https://NagellaNagaBharathKumar.github.io/Steganography-Tool/](https://NagellaNagaBharathKumar.github.io/Steganography-Tool/)

## How It Works

### Encoding
1. Select a cover image (PNG/BMP recommended)
2. Choose to hide either text or a file
3. The tool embeds your content into the image's least significant bits
4. Download the steganographic image

### Decoding
1. Upload a steganographic image
2. The tool extracts and displays hidden content
3. If a file was hidden, download it directly

## Technical Details

- **Steganography Method**: LSB (Least Significant Bit) steganography
- **Format Support**: PNG, BMP, JPEG (PNG/BMP recommended for lossless storage)
- **Payload Format**: 
  - 4 bytes: payload length (big endian)
  - 2 bytes: filename length (big endian)
  - N bytes: filename (UTF-8)
  - M bytes: actual data

## File Structure

```
├── index.html          # Main page (embedded CSS)
├── steg.js             # Steganography algorithms
├── static/
│   └── style.css       # Styling (optional, now embedded)
├── app.py              # Original Flask backend (deprecated)
├── templates/          # Original Flask templates (deprecated)
└── README.md           # This file
```

## Local Development

To test locally:

```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or with Node.js
npx http-server

# Visit: http://localhost:8000
```

## Deployment on GitHub Pages

This repository is configured to use GitHub Pages automatically:

1. **Settings → Pages**: Ensure source is set to "main" branch
2. **Access**: Your site will be available at `https://USERNAME.github.io/Steganography-Tool/`

### Enable GitHub Pages

If not already enabled:

1. Go to **Settings** → **Pages**
2. Select **Deploy from a branch**
3. Choose **main** branch
4. Click **Save**

Your site will be live in a few minutes!

## Browser Support

- Chrome/Chromium ✅
- Firefox ✅
- Safari ✅
- Edge ✅

Requires:
- ES6 JavaScript support
- Canvas API
- File API
- Blob API

## Capacity Calculator

Image capacity depends on dimensions:
- **Formula**: `width × height × 3 × 8 bits`
- **Example**: 1000×1000 image = ~24 MB capacity

The first 6 bytes are reserved for the payload header.

## Security Notes

- ⚠️ LSB steganography is fragile against image manipulation
- ✅ Use lossless formats (PNG/BMP) to preserve hidden data
- ✅ JPEG compression will destroy hidden data
- ✅ No encryption - use alongside encryption tools for sensitive data

## Original Flask Version

The original Flask-based backend is included for reference:
- `app.py` - Backend server
- `requirements.txt` - Python dependencies
- `templates/` - HTML templates
- `run.bat` - Windows batch runner

To run locally: `pip install -r requirements.txt && python app.py`

## Migration from Flask to GitHub Pages

Changes made:
1. ✅ Python logic converted to JavaScript
2. ✅ Flask routes replaced with event handlers
3. ✅ Server-side file storage replaced with browser downloads
4. ✅ Jinja2 templates replaced with vanilla HTML/JS
5. ✅ CSS embedded directly in HTML for portability

## API Reference

### `bytesToBits(data)`
Converts bytes to individual bits.

### `bitsToBytesArray(bits)`
Converts bit array back to bytes.

### `packPayload(filename, data)`
Packages data with metadata header.

### `unpackPayload(blob)`
Extracts data and filename from payload.

### `embedPayloadIntoImage(imageData, payload)`
Embeds payload into image using LSB technique.

### `extractAllBytesFromImage(imageData)`
Extracts all LSBs from image.

## Troubleshooting

### "Payload too large for image"
- Use a larger image
- Or hide less data

### "No hidden data found"
- Make sure it's a steganographic image
- Image might be corrupted or compressed as JPEG

### Image not loading
- Check browser console for errors
- Ensure image format is supported (PNG/BMP)

## License

This project is open source. See repository for details.

## Project Report

For detailed technical documentation, see: [Steganography-Tool-Project-Report.pdf](Steganography-Tool-Project-Report.pdf)

## Contributing

Found a bug? Want to improve? Feel free to open an issue or pull request!

---

**Built with ❤️ for privacy-conscious users**

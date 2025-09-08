# Steganography Tool for Text/File Hiding

This project is a simple **Steganography Web Tool** built with **Flask** that allows you to hide secret text or files inside an image using the **Least Significant Bit (LSB)** technique.  
It provides both **encoding (hiding)** and **decoding (extracting)** features through an interactive web interface.

## Features
- Hide text or files inside images (PNG/BMP recommended).
- Retrieve hidden data from stego images.
- Clean web interface with Encode/Decode options.
- Flash messages for status updates.
- Secure handling of files (saved in respective folders).

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NagellaNagaBharathKumar/Steganography-Tool.git
   cd Steganography-Tool
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
3. **Run the application**
- **On Windows**
- You can either run using the batch file:
   ```bash
   run.bat
- Or run directly:
   ```bash
   python app.py
- **On Linux/Mac**
- Simply run:
   ```bash
   python3 app.py
4. **Open in browser**
   ```bash
   http://127.0.0.1:5000/

## Usage
**Encoding (Hiding Data)**
1. Go to the Encode section.
2. Upload a cover image (PNG/BMP).
3. Choose either:
- Enter text message
- Upload a file
4. Click Encode → A stego image will be downloaded directly into the encoded_images folder.

**Decoding (Extracting Data)**
1. Go to the Decode section.
2. Upload the stego image.
- If text was hidden → It will be displayed in the browser.
- If file was hidden → It will be saved in the decoded_files folder.

## Conclusion

This project shows how to hide text or files inside images using LSB steganography. It is easy to use and keeps the image looking the same, making it a simple way to send secret information.

from flask import Flask, render_template, request, redirect, url_for, flash, send_file, send_from_directory
from PIL import Image
import os, struct, datetime

app = Flask(__name__)

app.secret_key = "change-this"

# Define folders
UPLOAD_FOLDER = "uploads"
ENCODED_IMAGES_FOLDER = "encoded_images"
DECODED_FILES_FOLDER = "decoded_files"

# Create folders if not exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCODED_IMAGES_FOLDER, exist_ok=True)
os.makedirs(DECODED_FILES_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Helpers: bytes <-> bits

def bytes_to_bits(data: bytes):
    for b in data:
        for i in range(7, -1, -1):
            yield (b >> i) & 1

def bits_to_bytes(bits):
    out = bytearray()
    cur = 0
    cnt = 0
    for bit in bits:
        cur = (cur << 1) | (bit & 1)
        cnt += 1
        if cnt == 8:
            out.append(cur)
            cur = 0
            cnt = 0
    return bytes(out)

def get_capacity_bits(img: Image.Image) -> int:
    w, h = img.size
    return w * h * 3  # 1 LSB per R,G,B

def embed_payload_into_image(img: Image.Image, payload: bytes):
    bits = list(bytes_to_bits(payload))
    total_bits = len(bits)

    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    pixels = img.load()
    w, h = img.size

    idx = 0
    for y in range(h):
        for x in range(w):
            px = list(pixels[x, y])
            for c in range(3):
                if idx < total_bits:
                    px[c] = (px[c] & ~1) | bits[idx]
                    idx += 1
            if img.mode == "RGBA":
                pixels[x, y] = (px[0], px[1], px[2], pixels[x, y][3])
            else:
                pixels[x, y] = (px[0], px[1], px[2])
            if idx >= total_bits:
                return img
    return img

def extract_all_bytes_from_image(img: Image.Image):
    bits = []
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
    pixels = img.load()
    w, h = img.size

    for y in range(h):
        for x in range(w):
            px = pixels[x, y]
            for c in range(3):
                bits.append(px[c] & 1)
    return bits_to_bytes(bits)

# Payload format:
# 4 bytes payload_len (unsigned int, big endian)
# 2 bytes name_len (unsigned short, big endian)
# name_len bytes: filename utf-8 (empty for text)
# payload_len bytes: actual data (for text: utf-8 bytes; for file: raw bytes)

def pack_payload(filename: str, data: bytes) -> bytes:
    name_bytes = filename.encode("utf-8") if filename else b""
    payload_len = len(data)
    header = struct.pack("!IH", payload_len, len(name_bytes))
    return header + name_bytes + data

def unpack_payload(blob: bytes):
    if len(blob) < 6:
        raise ValueError("Payload too small")
    payload_len, name_len = struct.unpack("!IH", blob[:6])
    expected_total = 6 + name_len + payload_len
    if len(blob) < expected_total:
        raise ValueError("Incomplete payload extracted")
    name_bytes = blob[6:6+name_len]
    data = blob[6+name_len:6+name_len+payload_len]
    filename = name_bytes.decode("utf-8") if name_len > 0 else ""
    return filename, data

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", decoded_text=None)

@app.route("/encode", methods=["POST"])
def encode():
    method = request.form.get("method")
    cover = request.files.get("cover_image")
    if not cover or cover.filename == "":
        flash("Please choose a cover image (PNG/BMP recommended).")
        return redirect(url_for("index"))

    cover_path = os.path.join(app.config["UPLOAD_FOLDER"], cover.filename)
    cover.save(cover_path)
    img = Image.open(cover_path)

    if method == "text":
        message = request.form.get("message", "")
        if message == "":
            flash("Enter a message to hide.")
            return redirect(url_for("index"))
        data = message.encode("utf-8")
        payload = pack_payload("", data)
    else:
        payload_file = request.files.get("payload_file")
        if not payload_file or payload_file.filename == "":
            flash("Please choose a file to hide.")
            return redirect(url_for("index"))
        filename = payload_file.filename
        file_bytes = payload_file.read()
        payload = pack_payload(filename, file_bytes)

    need_bits = len(payload) * 8
    cap = get_capacity_bits(img)
    if need_bits > cap:
        flash(f"Payload too large for image. Need {need_bits} bits, capacity {cap} bits.")
        return redirect(url_for("index"))

    stego = embed_payload_into_image(img, payload)

    # Generate timestamped filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    out_name = f"stego_{timestamp}.png"
    out_path = os.path.join(ENCODED_IMAGES_FOLDER, out_name)
    stego.save(out_path, "PNG")

    # Send file to client for download
    return send_file(out_path, mimetype="image/png", as_attachment=True, download_name=out_name)

@app.route("/decode", methods=["POST"])
def decode():
    stego = request.files.get("stego_image")
    if not stego or stego.filename == "":
        flash("Please choose a stego image to decode.")
        return redirect(url_for("index"))

    stego_path = os.path.join(app.config["UPLOAD_FOLDER"], stego.filename)
    stego.save(stego_path)
    img = Image.open(stego_path)

    all_bytes = extract_all_bytes_from_image(img)
    try:
        filename, data = unpack_payload(all_bytes)
    except Exception:
        flash("No hidden data found or extraction failed.")
        return redirect(url_for("index"))

    if filename:
        # save file with original name; avoid overwrite
        save_path = os.path.join(DECODED_FILES_FOLDER, filename)
        base, ext = os.path.splitext(save_path)
        i = 1
        while os.path.exists(save_path):
            save_path = f"{base}_{i}{ext}"
            i += 1
        with open(save_path, "wb") as f:
            f.write(data)
        flash(f"Extracted file saved as decoded_files/{os.path.basename(save_path)}")
        return redirect(url_for("index"))
    else:
        try:
            text = data.decode("utf-8")
        except Exception:
            text = ""
        return render_template("index.html", decoded_text=text)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    app.run(debug=True)

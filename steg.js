// Steganography Tool - Client-side JavaScript implementation
// Replaces Flask backend logic with pure JavaScript

// ============ Utility Functions ============

function bytesToBits(data) {
  const bits = [];
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    for (let j = 7; j >= 0; j--) {
      bits.push((byte >> j) & 1);
    }
  }
  return bits;
}

function bitsToBytesArray(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8 && i + j < bits.length; j++) {
      byte = (byte << 1) | (bits[i + j] & 1);
    }
    bytes.push(byte);
  }
  return new Uint8Array(bytes);
}

function getCapacityBits(imageData) {
  const w = imageData.width;
  const h = imageData.height;
  return w * h * 3; // 1 LSB per R,G,B
}

function packPayload(filename, data) {
  const nameBytes = new TextEncoder().encode(filename || "");
  const payloadLen = data.length;
  const nameLenVal = nameBytes.length;
  
  // Create header: 4 bytes payload_len (big endian) + 2 bytes name_len (big endian)
  const header = new Uint8Array(6);
  header[0] = (payloadLen >> 24) & 0xFF;
  header[1] = (payloadLen >> 16) & 0xFF;
  header[2] = (payloadLen >> 8) & 0xFF;
  header[3] = payloadLen & 0xFF;
  header[4] = (nameLenVal >> 8) & 0xFF;
  header[5] = nameLenVal & 0xFF;
  
  const result = new Uint8Array(header.length + nameBytes.length + data.length);
  result.set(header, 0);
  result.set(nameBytes, 6);
  result.set(data, 6 + nameBytes.length);
  
  return result;
}

function unpackPayload(blob) {
  if (blob.length < 6) {
    throw new Error("Payload too small");
  }
  
  const payloadLen = (blob[0] << 24) | (blob[1] << 16) | (blob[2] << 8) | blob[3];
  const nameLen = (blob[4] << 8) | blob[5];
  const expectedTotal = 6 + nameLen + payloadLen;
  
  if (blob.length < expectedTotal) {
    throw new Error("Incomplete payload extracted");
  }
  
  const nameBytes = blob.slice(6, 6 + nameLen);
  const data = blob.slice(6 + nameLen, 6 + nameLen + payloadLen);
  
  let filename = "";
  try {
    filename = new TextDecoder().decode(nameBytes);
  } catch (e) {
    filename = "";
  }
  
  return { filename, data };
}

function embedPayloadIntoImage(imageData, payload) {
  const bits = bytesToBits(payload);
  const totalBits = bits.length;
  const pixels = imageData.data;
  
  let idx = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    // Process RGB (skip Alpha at i+3)
    for (let c = 0; c < 3; c++) {
      if (idx < totalBits) {
        pixels[i + c] = (pixels[i + c] & ~1) | bits[idx];
        idx++;
      }
    }
    if (idx >= totalBits) {
      break;
    }
  }
  
  return imageData;
}

function extractAllBytesFromImage(imageData) {
  const bits = [];
  const pixels = imageData.data;
  
  for (let i = 0; i < pixels.length; i += 4) {
    // Extract from RGB (skip Alpha at i+3)
    for (let c = 0; c < 3; c++) {
      bits.push(pixels[i + c] & 1);
    }
  }
  
  return bitsToBytesArray(bits);
}

function downloadFile(data, filename) {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============ UI Functions ============

function showMessage(message, isError = false) {
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = `<li>${message}</li>`;
  messagesDiv.className = `flash ${isError ? 'error' : ''}`;
  messagesDiv.style.display = 'block';
  setTimeout(() => {
    messagesDiv.style.display = 'none';
  }, 5000);
}

function toggleEncodeMethod() {
  const method = document.querySelector('input[name="method"]:checked').value;
  document.getElementById('textBlock').style.display = method === 'text' ? 'block' : 'none';
  document.getElementById('fileBlock').style.display = method === 'file' ? 'block' : 'none';
}

// ============ Encode Handler ============

document.getElementById('encodeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const coverImageFile = document.getElementById('coverImage').files[0];
  if (!coverImageFile) {
    showMessage('Please choose a cover image (PNG/BMP recommended).', true);
    return;
  }
  
  const method = document.querySelector('input[name="method"]:checked').value;
  let payload;
  
  try {
    if (method === 'text') {
      const message = document.getElementById('message').value;
      if (!message) {
        showMessage('Enter a message to hide.', true);
        return;
      }
      const data = new TextEncoder().encode(message);
      payload = packPayload("", data);
    } else {
      const payloadFile = document.getElementById('payloadFile').files[0];
      if (!payloadFile) {
        showMessage('Please choose a file to hide.', true);
        return;
      }
      const fileData = new Uint8Array(await payloadFile.arrayBuffer());
      payload = packPayload(payloadFile.name, fileData);
    }
    
    // Load image
    const img = new Image();
    img.onload = async () => {
      const encodeProgress = document.getElementById('encodeProgress');
      encodeProgress.classList.add('active');
      
      // Create canvas and get image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Check capacity
      const needBits = payload.length * 8;
      const cap = getCapacityBits(imageData);
      
      if (needBits > cap) {
        showMessage(`Payload too large for image. Need ${needBits} bits, capacity ${cap} bits.`, true);
        encodeProgress.classList.remove('active');
        return;
      }
      
      // Embed payload
      embedPayloadIntoImage(imageData, payload);
      ctx.putImageData(imageData, 0, 0);
      
      // Download
      const timestamp = new Date().toISOString().replace(/[:\-T]/g, '').substring(0, 15);
      const filename = `stego_${timestamp}.png`;
      canvas.toBlob((blob) => {
        downloadFile(blob, filename);
        showMessage(`Stego image created and downloaded as ${filename}`);
        encodeProgress.classList.remove('active');
        document.getElementById('encodeForm').reset();
        toggleEncodeMethod();
      }, 'image/png');
    };
    
    img.onerror = () => {
      showMessage('Failed to load image.', true);
      document.getElementById('encodeProgress').classList.remove('active');
    };
    
    img.src = URL.createObjectURL(coverImageFile);
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    document.getElementById('encodeProgress').classList.remove('active');
  }
});

// ============ Decode Handler ============

let decodedData = null;
let decodedFilename = null;

document.getElementById('decodeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const stegoImageFile = document.getElementById('stegoImage').files[0];
  if (!stegoImageFile) {
    showMessage('Please choose a stego image to decode.', true);
    return;
  }
  
  const decodeProgress = document.getElementById('decodeProgress');
  decodeProgress.classList.add('active');
  
  try {
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const allBytes = extractAllBytesFromImage(imageData);
      
      try {
        const { filename, data } = unpackPayload(allBytes);
        decodedFilename = filename;
        decodedData = data;
        
        const resultContainer = document.getElementById('resultContainer');
        const decodedResult = document.getElementById('decodedResult');
        
        if (filename) {
          resultContainer.innerHTML = `<p><strong>File:</strong> ${filename}</p><p>File size: ${data.length} bytes</p>`;
          decodedResult.style.display = 'block';
          showMessage(`File extracted: ${filename}`);
        } else {
          try {
            const text = new TextDecoder().decode(data);
            resultContainer.innerHTML = `<textarea readonly rows="8">${text}</textarea>`;
            decodedResult.style.display = 'block';
            showMessage('Text extracted successfully');
          } catch (e) {
            showMessage('Extracted data is binary and cannot be displayed as text.', true);
          }
        }
      } catch (error) {
        showMessage('No hidden data found or extraction failed.', true);
      }
      
      decodeProgress.classList.remove('active');
    };
    
    img.onerror = () => {
      showMessage('Failed to load image.', true);
      decodeProgress.classList.remove('active');
    };
    
    img.src = URL.createObjectURL(stegoImageFile);
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
    decodeProgress.classList.remove('active');
  }
});

function downloadDecodedFile() {
  if (decodedData && decodedFilename) {
    downloadFile(decodedData, decodedFilename);
    showMessage(`Downloaded: ${decodedFilename}`);
  }
}

// Initialize
toggleEncodeMethod();

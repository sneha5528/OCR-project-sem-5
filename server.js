const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Render uses dynamic PORT

app.use(cors());

// ✅ Serve static files from "Public" (frontend)
app.use(express.static(path.join(__dirname, 'Public')));

// ✅ Uploads directory (ephemeral on Render)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// OCR route
app.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imagePath = req.file.path;

    // Perform OCR
    const {
      data: { text },
    } = await tesseract.recognize(imagePath, 'eng');

    // Delete file after use
    fs.unlink(imagePath, () => {});

    res.json({ text });
  } catch (err) {
    console.error('OCR error:', err.message);
    res
      .status(500)
      .json({ error: 'OCR failed', details: err.message });
  }
});

// ✅ Catch-all route for frontend (important for Render)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ OCR backend running on port ${PORT}`);
});

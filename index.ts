import express from "express"
import multer from 'multer'
import sharp from 'sharp'
import { config } from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const images = {};
config()
app.post('/upload', upload.single('image'), (req, res) => {
  const imageBuffer = req.file.buffer;
  const imageId = Date.now().toString();
  images[imageId] = imageBuffer;
  res.json({ id: imageId });
});


app.get('/resize/:id', async (req, res) => {
  const id = req.params.id;
  const { width, height } = req.query;
  
  if (!images[id]) {
    return res.status(404).json({ error: 'Image not found' });
  }

  try {
    const resizedImageBuffer = await sharp(images[id])
      .resize(Number(width), Number(height))
      .toBuffer();
    res.contentType('image/jpeg');
    res.send(resizedImageBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Image processing failed' });
  }
});


app.get('/image/:id', (req, res) => {
  const id = req.params.id;
  const imageBuffer = images[id];

  if (!imageBuffer) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.contentType('image/jpeg');
  res.send(imageBuffer);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

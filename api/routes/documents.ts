import { Router } from 'express';
import multer from 'multer';
import { documentService } from '../services/documentService.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const document = await documentService.processDocument(req.file);
    res.json({ success: true, document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

router.get('/', async (req, res) => {
  try {
    const documents = documentService.getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = documentService.deleteDocument(req.params.id);
    res.json({ success });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;

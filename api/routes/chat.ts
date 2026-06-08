import { Router } from 'express';
import { chatService } from '../services/chatService';

const router = Router();

router.post('/', async (req, res) => {
  try {
    console.log('=== Chat Request Received ===');
    console.log('Question:', req.body.question);
    console.log('History length:', req.body.history?.length || 0);
    
    const response = await chatService.chat(req.body);
    
    console.log('Chat Response:', JSON.stringify(response, null, 2));
    console.log('=== Chat Request Completed ===\n');
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = chatService.getSettings();
    res.json({ ...settings, openaiApiKey: undefined });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    chatService.updateSettings(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET ALL CONVERSATIONS
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.user.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
});

// GET MESSAGES FOR CONVERSATION
router.get('/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id: req.params.id }
        });

        if (!conversation || conversation.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId: req.params.id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// CREATE CONVERSATION OR ADD MESSAGE
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { conversationId, title, role, content } = req.body;

    try {
        let currentConvId = conversationId;

        if (!currentConvId) {
            const newConv = await prisma.conversation.create({
                data: {
                    userId: req.user.userId,
                    title: title || content.substring(0, 50) + '...'
                }
            });
            currentConvId = newConv.id;
        }

        const message = await prisma.message.create({
            data: {
                conversationId: currentConvId,
                role,
                content
            }
        });

        // Update updatedAt to sort by activity
        await prisma.conversation.update({
            where: { id: currentConvId },
            data: { updatedAt: new Date() }
        });

        res.json({ conversationId: currentConvId, message });
    } catch (error) {
        res.status(500).json({ error: 'Error saving message' });
    }
});

export default router;

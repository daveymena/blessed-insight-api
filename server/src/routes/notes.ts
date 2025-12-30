import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET ALL NOTES FOR USER
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const notes = await prisma.note.findMany({
            where: { userId: req.user.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// CREATE OR UPDATE NOTE
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { bookId, chapter, verse, content, color } = req.body;

    try {
        // Simple search for existing note for this verse
        let note;
        if (verse) {
            note = await prisma.note.findFirst({
                where: {
                    userId: req.user.userId,
                    bookId,
                    chapter,
                    verse
                }
            });
        }

        if (note) {
            const updated = await prisma.note.update({
                where: { id: note.id },
                data: { content, color }
            });
            return res.json(updated);
        }

        const newNote = await prisma.note.create({
            data: {
                userId: req.user.userId,
                bookId,
                chapter,
                verse,
                content,
                color
            }
        });
        res.json(newNote);
    } catch (error) {
        res.status(500).json({ error: 'Error saving note' });
    }
});

// DELETE NOTE
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const note = await prisma.note.findUnique({ where: { id: req.params.id } });
        if (!note || note.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await prisma.note.delete({ where: { id: req.params.id } });
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting note' });
    }
});

export default router;

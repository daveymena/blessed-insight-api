import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { personalStudyService } from '@/lib/personalStudyService';
import { toast } from 'sonner';

interface NoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bookId: string;
    bookName: string;
    chapter: number;
    verse?: number;
    existingContent?: string;
    onSave?: () => void;
}

export function NoteDialog({
    isOpen,
    onClose,
    bookId,
    bookName,
    chapter,
    verse,
    existingContent = '',
    onSave
}: NoteDialogProps) {
    const [content, setContent] = useState(existingContent);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            const result = await personalStudyService.saveNote({
                bookId,
                chapter,
                verse,
                content: content.trim()
            });

            if (result) {
                toast.success('Nota guardada correctamente');
                onSave?.();
                onClose();
            } else {
                toast.error('Error al guardar la nota. Inicia sesión primero.');
            }
        } catch (err) {
            toast.error('Error de conexión');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-serif">
                        Nota para {bookName} {chapter}{verse ? `:${verse}` : ''}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Escribe tus reflexiones o notas de estudio aquí..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[150px] font-sans"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Guardando...' : 'Guardar Nota'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

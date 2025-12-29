import { useState, useEffect } from 'react';
import { X, Heart, Trash2, Highlighter, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Favorite {
  reference: string;
  text?: string;
  addedAt: string;
}

export function FavoritesPanel({ isOpen, onClose }: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedFavorites = localStorage.getItem('bible_favorites');
    const savedHighlights = localStorage.getItem('bible_highlights');
    const savedNotes = localStorage.getItem('bible_notes');

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, [isOpen]);

  const removeFavorite = (reference: string) => {
    const updated = favorites.filter((f) => f.reference !== reference);
    setFavorites(updated);
    localStorage.setItem('bible_favorites', JSON.stringify(updated));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
            Mis Favoritos
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-4 pr-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No tienes versículos favoritos aún.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Haz clic en un versículo mientras lees para guardarlo.
                </p>
              </div>
            ) : (
              favorites.map((fav, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-3">
                    <Heart className="h-4 w-4 text-red-500 mt-1" fill="currentColor" />
                    <div>
                      <span className="font-medium">{fav.reference}</span>
                      {fav.text && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{fav.text}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFavorite(fav.reference)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-500">{favorites.length}</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{highlights.length}</p>
              <p className="text-xs text-muted-foreground">Resaltados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{Object.keys(notes).length}</p>
              <p className="text-xs text-muted-foreground">Notas</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

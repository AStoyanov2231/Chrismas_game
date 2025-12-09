export interface ScratchItemData {
  id: number;
  value: number;
  isRevealed: boolean;
}

export interface ScratchCardProps {
  item: ScratchItemData;
  onReveal: (id: number) => void;
  onStartScratch: (id: number) => void;
  onScratchEnd: () => void;
  isLocked: boolean;
  width?: number;
  height?: number;
}

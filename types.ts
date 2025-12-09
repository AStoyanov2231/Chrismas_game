export interface ScratchItemData {
  id: number;
  value: number;
  isRevealed: boolean;
}

export interface ScratchCardProps {
  item: ScratchItemData;
  onReveal: (id: number) => void;
  width?: number;
  height?: number;
}

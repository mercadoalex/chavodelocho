import type { Tile as TileData } from '../engine/types';
import styles from './Tile.module.css';

interface TileProps {
  tile: TileData;
  isHighlighted: boolean;
  onClick: () => void;
}

/** SVG data-URI fallback used when an image fails to load */
const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
      '<rect width="40" height="40" rx="4" fill="#b0855e"/>' +
      '<text x="20" y="24" text-anchor="middle" font-size="14" fill="#fff">?</text>' +
    '</svg>',
  );

function handleImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_SRC) {
    console.warn(`Image failed to load: ${img.src}`);
    img.src = FALLBACK_SRC;
  }
}

function tileImage(tile: TileData): string | null {
  switch (tile.content.type) {
    case 'obstacle':
      return '/images/barril2.png';
    case 'weapon':
      return tile.content.weapon.image;
    case 'player':
      return tile.content.playerId === 'player1'
        ? '/images/chavo.png'
        : '/images/kiko.png';
    default:
      return null;
  }
}

export default function Tile({ tile, isHighlighted, onClick }: TileProps) {
  const src = tileImage(tile);
  const className = [styles.tile, isHighlighted ? styles.highlighted : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      data-testid={`tile-${tile.position.x}-${tile.position.y}`}
      role={isHighlighted ? 'button' : undefined}
      tabIndex={isHighlighted ? 0 : undefined}
      onClick={isHighlighted ? onClick : undefined}
      onKeyDown={
        isHighlighted
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {src && <img src={src} alt={tile.content.type} onError={handleImgError} />}
    </div>
  );
}

import type { LadderCell } from '@ladder';

interface GlyphProps {
  cell: LadderCell;
  width: number;
  height: number;
}

export function LadderGlyph({ cell, width, height }: GlyphProps) {
  const midY = height / 2;
  const midX = width / 2;
  switch (cell.kind) {
    case 'normallyOpenContact':
      return (
        <g>
          <line x1="0" y1={midY} x2={midX - 8} y2={midY} />
          <line x1={midX - 8} y1={midY - 11} x2={midX - 8} y2={midY + 11} />
          <line x1={midX + 8} y1={midY - 11} x2={midX + 8} y2={midY + 11} />
          <line x1={midX + 8} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'normallyClosedContact':
      return (
        <g>
          <line x1="0" y1={midY} x2={midX - 8} y2={midY} />
          <line x1={midX - 8} y1={midY - 11} x2={midX - 8} y2={midY + 11} />
          <line x1={midX + 8} y1={midY - 11} x2={midX + 8} y2={midY + 11} />
          <line x1={midX - 10} y1={midY + 12} x2={midX + 10} y2={midY - 12} />
          <line x1={midX + 8} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'coil':
      return (
        <g>
          <line x1="0" y1={midY} x2={midX - 12} y2={midY} />
          <circle cx={midX} cy={midY} r="11" />
          <line x1={midX + 12} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'setCoil':
      return (
        <g>
          <line x1="0" y1={midY} x2={midX - 12} y2={midY} />
          <circle cx={midX} cy={midY} r="11" />
          <text x={midX} y={midY + 3} textAnchor="middle" className="glyph-letter">
            S
          </text>
          <line x1={midX + 12} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'resetCoil':
      return (
        <g>
          <line x1="0" y1={midY} x2={midX - 12} y2={midY} />
          <circle cx={midX} cy={midY} r="11" />
          <text x={midX} y={midY + 3} textAnchor="middle" className="glyph-letter">
            R
          </text>
          <line x1={midX + 12} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'verticalLink':
      return (
        <g>
          <line x1="0" y1={midY} x2={width} y2={midY} />
          <line x1={midX} y1={midY} x2={midX} y2={height} />
        </g>
      );
    case 'functionBlock':
      return (
        <g>
          <line x1="0" y1={midY} x2={8} y2={midY} />
          <rect x="8" y="8" width={width - 16} height={height - 16} />
          <text x={midX} y={midY + 3} textAnchor="middle" className="glyph-letter">
            {cell.blockKind === 'counter' ? 'C' : 'TM'}
          </text>
          <line x1={width - 8} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'compare':
      return (
        <g>
          <line x1="0" y1={midY} x2={8} y2={midY} />
          <rect x="8" y="8" width={width - 16} height={height - 16} />
          <text x={midX} y={midY + 3} textAnchor="middle" className="glyph-letter">
            CMP
          </text>
          <line x1={width - 8} y1={midY} x2={width} y2={midY} />
        </g>
      );
    case 'operate':
      return (
        <g>
          <line x1="0" y1={midY} x2={8} y2={midY} />
          <rect x="8" y="8" width={width - 16} height={height - 16} />
          <text x={midX} y={midY + 3} textAnchor="middle" className="glyph-letter">
            OP
          </text>
          <line x1={width - 8} y1={midY} x2={width} y2={midY} />
        </g>
      );
    default:
      return <line x1="0" y1={midY} x2={width} y2={midY} />;
  }
}

import { Group, Line, Rect } from 'react-konva'
import BaseShape, { Geometry, ShapeStyle } from './BaseShape'

export type OpeningType = 'door' | 'window' | 'sliding' | 'folding' | 'fixed'
export type OpeningDirection = 'left' | 'right' | 'both'

interface OpeningStyle extends ShapeStyle {
  frameColor: string
  frameWidth: number
  glassOpacity?: number
}

interface OpeningProps {
  id: string
  type: OpeningType
  width: number
  height: number
  elevation: number
  direction?: OpeningDirection
  swing?: number
  isExterior?: boolean
  sillHeight?: number
  lintelHeight?: number
  geometry: Geometry
  style: OpeningStyle
  selected?: boolean
  interactive?: boolean
  onSelect?: () => void
  onGeometryChange?: (geometry: Geometry) => void
}

function Opening({
  id,
  type,
  width,
  height,
  elevation,
  direction = 'left',
  swing = 90,
  isExterior = false,
  sillHeight = 0,
  lintelHeight = 0,
  geometry,
  style,
  selected,
  interactive,
  onSelect,
  onGeometryChange
}: OpeningProps) {
  // 開口部の枠を描画
  const renderFrame = () => {
    const { x, y, width: w, height: h } = geometry
    const { frameColor, frameWidth } = style

    return (
      <>
        {/* 外枠 */}
        <Rect
          x={x}
          y={y}
          width={w}
          height={h}
          stroke={frameColor}
          strokeWidth={frameWidth}
          fill="transparent"
        />
        
        {/* 開口部タイプに応じた表現 */}
        {type === 'window' && (
          <Rect
            x={x + frameWidth}
            y={y + frameWidth}
            width={w - frameWidth * 2}
            height={h - frameWidth * 2}
            fill="#E3F2FD"
            opacity={style.glassOpacity || 0.3}
          />
        )}
        
        {/* 開き戸の場合は開き方向を表示 */}
        {(type === 'door' || type === 'folding') && (
          <Line
            points={[
              x,
              y + h,
              x + (direction === 'right' ? w : 0),
              y + h,
              x + (direction === 'right' ? w - w * Math.cos(swing * Math.PI / 180) : w * Math.cos(swing * Math.PI / 180)),
              y + h - w * Math.sin(swing * Math.PI / 180)
            ]}
            stroke="#999999"
            strokeWidth={1}
            dash={[5, 5]}
          />
        )}
      </>
    )
  }

  return (
    <Group>
      <BaseShape
        id={id}
        geometry={geometry}
        style={style}
        selected={selected}
        interactive={interactive}
        onSelect={onSelect}
        onGeometryChange={onGeometryChange}
      />
      {renderFrame()}
    </Group>
  )
}

export default Opening 
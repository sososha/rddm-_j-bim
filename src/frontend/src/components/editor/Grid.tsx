import { Line } from 'react-konva'

interface GridProps {
  width: number
  height: number
  spacing: number
  color?: string
  opacity?: number
  scale: number
}

function Grid({
  width,
  height,
  spacing = 20,
  color = '#CCCCCC',
  opacity = 0.3,
  scale
}: GridProps) {
  // スケールに応じてグリッドの間隔を調整
  const adjustedSpacing = spacing * scale
  
  // グリッド線の生成
  const lines = []
  
  // 垂直線
  for (let x = 0; x <= width; x += adjustedSpacing) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={color}
        strokeWidth={1 / scale}
        opacity={opacity}
      />
    )
  }
  
  // 水平線
  for (let y = 0; y <= height; y += adjustedSpacing) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={color}
        strokeWidth={1 / scale}
        opacity={opacity}
      />
    )
  }

  return <>{lines}</>
}

export default Grid 
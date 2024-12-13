import BaseShape, { Geometry, ShapeStyle } from './BaseShape'
import { Text, Group } from 'react-konva'

export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'other'

interface RoomProps {
  id: string
  type: RoomType
  name: string
  area: number
  geometry: Geometry
  style: ShapeStyle
  selected?: boolean
  interactive?: boolean
  onSelect?: () => void
  onGeometryChange?: (geometry: Geometry) => void
}

function Room({
  id,
  type,
  name,
  area,
  geometry,
  style,
  selected,
  interactive,
  onSelect,
  onGeometryChange
}: RoomProps) {
  // 部屋名とエリアのテキストスタイル
  const textStyle = {
    fontSize: 14,
    fill: '#000000',
    align: 'center' as const,
    verticalAlign: 'middle' as const
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
      <Text
        x={geometry.x + geometry.width / 2}
        y={geometry.y + geometry.height / 2 - 10}
        text={name}
        {...textStyle}
        offsetX={textStyle.fontSize * name.length / 4}
        offsetY={textStyle.fontSize / 2}
      />
      <Text
        x={geometry.x + geometry.width / 2}
        y={geometry.y + geometry.height / 2 + 10}
        text={`${area}㎡`}
        {...textStyle}
        offsetX={textStyle.fontSize * area.toString().length / 4}
        offsetY={textStyle.fontSize / 2}
      />
    </Group>
  )
}

export default Room 
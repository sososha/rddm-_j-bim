import { Rect, Transformer } from 'react-konva'
import { useRef, useEffect } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'

export interface Geometry {
  x: number
  y: number
  width: number
  height: number
}

export interface ShapeStyle {
  fill: string
  stroke: string
  strokeWidth: number
}

interface BaseShapeProps {
  id: string
  geometry: Geometry
  style: ShapeStyle
  selected?: boolean
  interactive?: boolean
  onSelect?: () => void
  onGeometryChange?: (geometry: Geometry) => void
}

function BaseShape({
  id,
  geometry,
  style,
  selected = false,
  interactive = true,
  onSelect,
  onGeometryChange
}: BaseShapeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)

  useEffect(() => {
    if (selected && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [selected])

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (onGeometryChange) {
      const node = e.target
      onGeometryChange({
        ...geometry,
        x: node.x(),
        y: node.y()
      })
    }
  }

  const handleTransformEnd = () => {
    if (onGeometryChange && shapeRef.current) {
      const node = shapeRef.current
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()

      node.scaleX(1)
      node.scaleY(1)

      onGeometryChange({
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY)
      })
    }
  }

  return (
    <>
      <Rect
        ref={shapeRef}
        {...geometry}
        {...style}
        draggable={interactive}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {selected && interactive && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 最小サイズを制限
            const minSize = 5
            const box = { ...newBox }
            if (box.width < minSize) box.width = minSize
            if (box.height < minSize) box.height = minSize
            return box
          }}
        />
      )}
    </>
  )
}

export default BaseShape 
import { useRef, useState } from 'react'
import { Stage, Layer, Group } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { Vector2d } from 'konva/lib/types'
import Grid from './Grid'
import Room, { RoomType } from './shapes/Room'
import Opening, { OpeningType, OpeningDirection } from './shapes/Opening'
import BaseShape from './shapes/BaseShape'

export type ViewType = 'floor' | 'structure' | 'design'

export interface Element {
  id: string
  type: string
  name?: string
  roomType?: RoomType
  openingType?: OpeningType
  direction?: OpeningDirection
  swing?: number
  isExterior?: boolean
  sillHeight?: number
  lintelHeight?: number
  area?: number
  geometry: {
    x: number
    y: number
    width: number
    height: number
  }
  style: {
    fill: string
    stroke: string
    strokeWidth: number
    frameColor?: string
    frameWidth?: number
    glassOpacity?: number
  }
}

interface CanvasProps {
  width: number
  height: number
  elements: Element[]
  viewType: ViewType
  onElementSelect?: (element: Element) => void
  onElementUpdate?: (element: Element) => void
  onElementCreate?: (element: Element) => void
}

function Canvas({
  width,
  height,
  elements,
  viewType,
  onElementSelect,
  onElementUpdate,
  onElementCreate
}: CanvasProps) {
  const stageRef = useRef<any>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState<Vector2d>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ズーム処理
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale
    }

    const newScale = Math.min(
      Math.max(oldScale + (e.evt.deltaY > 0 ? -0.1 : 0.1), 0.1),
      5
    )

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    }

    setScale(newScale)
    setPosition(newPos)
  }

  // パン処理
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    setPosition(e.target.position())
  }

  // 要素選択処理
  const handleElementSelect = (element: Element) => {
    if (!isDragging) {
      setSelectedId(element.id)
      if (onElementSelect) {
        onElementSelect(element)
      }
    }
  }

  // 要素更新処理
  const handleElementUpdate = (element: Element, newGeometry: any) => {
    if (onElementUpdate) {
      onElementUpdate({
        ...element,
        geometry: newGeometry
      })
    }
  }

  // 要素のレンダリング
  const renderElement = (element: Element) => {
    const isSelected = element.id === selectedId

    switch (element.type) {
      case 'room':
        return (
          <Room
            key={element.id}
            id={element.id}
            type={element.roomType || 'other'}
            name={element.name || ''}
            area={element.area || 0}
            geometry={element.geometry}
            style={element.style}
            selected={isSelected}
            onSelect={() => handleElementSelect(element)}
            onGeometryChange={(geometry) => handleElementUpdate(element, geometry)}
          />
        )
      case 'opening':
        return (
          <Opening
            key={element.id}
            id={element.id}
            type={element.openingType || 'door'}
            width={element.geometry.width}
            height={element.geometry.height}
            elevation={0}
            direction={element.direction}
            swing={element.swing}
            isExterior={element.isExterior}
            sillHeight={element.sillHeight}
            lintelHeight={element.lintelHeight}
            geometry={element.geometry}
            style={{
              ...element.style,
              frameColor: element.style.frameColor || '#000000',
              frameWidth: element.style.frameWidth || 2,
              glassOpacity: element.style.glassOpacity
            }}
            selected={isSelected}
            onSelect={() => handleElementSelect(element)}
            onGeometryChange={(geometry) => handleElementUpdate(element, geometry)}
          />
        )
      default:
        return (
          <BaseShape
            key={element.id}
            id={element.id}
            geometry={element.geometry}
            style={element.style}
            selected={isSelected}
            onSelect={() => handleElementSelect(element)}
            onGeometryChange={(geometry) => handleElementUpdate(element, geometry)}
          />
        )
    }
  }

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onWheel={handleWheel}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      scale={{ x: scale, y: scale }}
      position={position}
    >
      <Layer>
        {/* 背景レイヤー */}
        <Group>
          <Grid
            width={width}
            height={height}
            spacing={20}
            scale={scale}
          />
        </Group>

        {/* コンテンツレイヤー */}
        <Group>
          {elements.map(renderElement)}
        </Group>

        {/* オーバーレイレイヤー */}
        <Group>
          {/* TODO: 選択ハイライトなど */}
        </Group>

        {/* インタラクションレイヤー */}
        <Group>
          {/* TODO: ドラッグハンドルなど */}
        </Group>
      </Layer>
    </Stage>
  )
}

export default Canvas 
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Stage, Layer } from 'react-konva'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Menu as MenuIcon,
  Architecture,
  ViewQuilt,
  ViewModule
} from '@mui/icons-material'

const DRAWER_WIDTH = 240

function Editor() {
  const { projectId } = useParams()
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)
  const [activeView, setActiveView] = useState<'floor' | 'structure' | 'design'>(
    'floor'
  )

  const handleViewChange = (view: 'floor' | 'structure' | 'design') => {
    setActiveView(view)
    // TODO: ビューの切り替え処理
  }

  return (
    <div className="h-screen flex flex-col">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className="ml-2">
            エディター
          </Typography>
        </Toolbar>
      </AppBar>

      <div className="flex flex-1 overflow-hidden">
        <Drawer
          variant="persistent"
          anchor="left"
          open={isDrawerOpen}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          <Toolbar />
          <List>
            <ListItem
              button
              selected={activeView === 'floor'}
              onClick={() => handleViewChange('floor')}
            >
              <ListItemIcon>
                <ViewQuilt />
              </ListItemIcon>
              <ListItemText primary="間取り図" />
            </ListItem>
            <ListItem
              button
              selected={activeView === 'structure'}
              onClick={() => handleViewChange('structure')}
            >
              <ListItemIcon>
                <ViewModule />
              </ListItemIcon>
              <ListItemText primary="構造図" />
            </ListItem>
            <ListItem
              button
              selected={activeView === 'design'}
              onClick={() => handleViewChange('design')}
            >
              <ListItemIcon>
                <Architecture />
              </ListItemIcon>
              <ListItemText primary="意匠図" />
            </ListItem>
          </List>
          <Divider />
          {/* TODO: ツールパレットを追加 */}
        </Drawer>

        <main
          className={`flex-1 ${
            isDrawerOpen ? `ml-[${DRAWER_WIDTH}px]` : ''
          } transition-all duration-200`}
        >
          <Stage
            width={window.innerWidth - (isDrawerOpen ? DRAWER_WIDTH : 0)}
            height={window.innerHeight - 64}
          >
            <Layer>
              {/* TODO: 図形要素を追加 */}
            </Layer>
          </Stage>
        </main>
      </div>
    </div>
  )
}

export default Editor 
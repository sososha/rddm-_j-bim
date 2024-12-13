import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box } from '@mui/material'

export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  selected?: boolean
  divider?: boolean
}

interface SidebarProps {
  items: MenuItem[]
  width?: number
  open?: boolean
  variant?: 'permanent' | 'persistent' | 'temporary'
  onClose?: () => void
}

function Sidebar({
  items,
  width = 240,
  open = true,
  variant = 'persistent',
  onClose
}: SidebarProps) {
  return (
    <Drawer
      variant={variant}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box'
        }
      }}
    >
      <Box role="navigation" aria-label="サイドメニュー">
        <List>
          {items.map((item) => (
            <Box key={item.id}>
              {item.divider ? (
                <Divider />
              ) : (
                <ListItem
                  button
                  selected={item.selected}
                  onClick={item.onClick}
                >
                  {item.icon && (
                    <ListItemIcon>{item.icon}</ListItemIcon>
                  )}
                  <ListItemText primary={item.label} />
                </ListItem>
              )}
            </Box>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

export default Sidebar 
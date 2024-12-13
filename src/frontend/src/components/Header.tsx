import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  actions?: React.ReactNode[]
  showMenuIcon?: boolean
}

function Header({ title, onMenuClick, actions = [], showMenuIcon = true }: HeaderProps) {
  return (
    <AppBar position="static" className="flex-shrink-0">
      <Toolbar>
        {showMenuIcon && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            className="mr-2"
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" component="h1" className="flex-grow">
          {title}
        </Typography>

        {actions.length > 0 && (
          <Box className="flex items-center gap-2">
            {actions}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header 
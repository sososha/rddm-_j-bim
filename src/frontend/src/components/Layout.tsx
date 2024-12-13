import { Outlet } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'

interface LayoutProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  children?: React.ReactNode
}

function Layout({ header, sidebar, children }: LayoutProps) {
  const content = children || <Outlet />

  return (
    <Box className="min-h-screen flex flex-col bg-gray-100">
      {header || (
        <AppBar position="static" className="flex-shrink-0">
          <Toolbar>
            <Typography variant="h6">RDDM J-BIM</Typography>
          </Toolbar>
        </AppBar>
      )}
      
      <Box className="flex flex-1 overflow-hidden">
        {sidebar && (
          <Box className="flex-shrink-0">
            {sidebar}
          </Box>
        )}
        
        <Box className="flex-1 overflow-auto">
          <Container maxWidth="xl" className="py-4">
            {content}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

export default Layout 
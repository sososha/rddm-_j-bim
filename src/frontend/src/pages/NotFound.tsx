import { Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Typography variant="h1" className="mb-4">
        404
      </Typography>
      <Typography variant="h4" className="mb-4">
        ページが見つかりません
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        ホームに戻る
      </Button>
    </div>
  )
}

export default NotFound 
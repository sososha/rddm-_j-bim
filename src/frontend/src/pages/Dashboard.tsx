import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

interface Project {
  id: string
  name: string
  description: string
  updatedAt: string
}

function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const handleCreateProject = () => {
    // TODO: APIを呼び出してプロジェクトを作成
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription,
      updatedAt: new Date().toISOString()
    }
    setProjects([...projects, newProject])
    setIsNewProjectDialogOpen(false)
    setNewProjectName('')
    setNewProjectDescription('')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4">プロジェクト一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsNewProjectDialogOpen(true)}
        >
          新規プロジェクト
        </Button>
      </div>

      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  最終更新: {new Date(project.updatedAt).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/editor/${project.id}`)}
                >
                  開く
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={isNewProjectDialogOpen}
        onClose={() => setIsNewProjectDialogOpen(false)}
      >
        <DialogTitle>新規プロジェクト作成</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロジェクト名"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="説明"
            fullWidth
            multiline
            rows={4}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewProjectDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleCreateProject} variant="contained">
            作成
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default Dashboard 
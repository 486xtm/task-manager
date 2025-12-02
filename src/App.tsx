import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { TaskBoardProvider } from './context/TaskBoardContext';
import { TaskBoard } from './components/TaskBoard';
import { TaskDetail } from './pages/TaskDetail';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TaskBoardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TaskBoard />} />
            <Route path="/task/:taskId" element={<TaskDetail />} />
          </Routes>
        </BrowserRouter>
      </TaskBoardProvider>
    </ThemeProvider>
  );
}

export default App;

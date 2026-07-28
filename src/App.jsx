import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Login/Login.jsx'
import Register from './pages/Register/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Projects from './pages/Projects/Projects.jsx'
import Bugs from './pages/Bugs/Bugs.jsx'
import BugDetails from './pages/BugDetails/BugDetails.jsx'
import CreateBug from './pages/CreateBug/CreateBug.jsx'
import EditBug from './pages/EditBug/EditBug.jsx'
import Users from './pages/Users/Users.jsx'
import Profile from './pages/Profile/Profile.jsx'
import Settings from './pages/Settings/Settings.jsx'
import Reports from './pages/Reports/Reports.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'
import Teams from './pages/Teams/Teams.jsx'
import WorkItems from './pages/Work/WorkItems.jsx'
import Kanban from './pages/Kanban/Kanban.jsx'
import Calendar from './pages/Calendar/Calendar.jsx'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/requirements" element={<WorkItems type="requirements" />} />
                <Route path="/tasks" element={<WorkItems type="tasks" />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/submissions" element={<WorkItems type="submissions" />} />
                <Route path="/bugs" element={<Bugs />} />
                <Route path="/bugs/new" element={<CreateBug />} />
                <Route path="/bugs/:id" element={<BugDetails />} />
                <Route path="/bugs/:id/edit" element={<EditBug />} />
                <Route path="/users" element={<Users />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3200 }} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import InventoryPage from './pages/InventoryPage'
import FinancePage from './pages/FinancePage'
import WorkersPage from './pages/WorkersPage'
import ZonesPage from './pages/ZonesPage'
import HarvestsPage from './pages/HarvestsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/workers" element={<WorkersPage />} />
        <Route path="/zones" element={<ZonesPage />} />
        <Route path="/harvests" element={<HarvestsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App

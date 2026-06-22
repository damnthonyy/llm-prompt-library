import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PromptListPage } from './pages/PromptListPage';
import { PromptDetailPage } from './pages/PromptDetailPage';
import { PromptFormPage } from './pages/PromptFormPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public: browse + auth */}
        <Route path="/" element={<PromptListPage />} />
        <Route path="/prompts/:id" element={<PromptDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated: create + edit */}
        <Route element={<ProtectedRoute />}>
          <Route path="/prompts/new" element={<PromptFormPage />} />
          <Route path="/prompts/:id/edit" element={<PromptFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Chat } from './pages/Chat';
import { Documents } from './pages/Documents';
import { Settings } from './pages/Settings';
import { Tables } from './pages/Tables';
import { Knowledge } from './pages/Knowledge';
import { Analysis } from './pages/Analysis';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

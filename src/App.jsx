import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Home from './pages/Home';
import VideoPageEditor from './pages/VideoPageEditor';
import VideoPageClient from './pages/VideoPageClient';

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <Signup /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/workspace/:wsid', element: <Workspace /> },
    { path: '/workspace/:wsid/video/:vid', element: <VideoPageEditor /> },
    { path: '/video/:id', element: <VideoPageClient /> },
    // Add more routes as needed
  ]);
  return routes;
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;

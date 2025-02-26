import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import VideoPage from './pages/VideoPage';
import VideoReview from './pages/VideoReview';
import Home from './pages/Home';

const AppRoutes = () => {
  const routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <Signup /> },
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/workspace/:wsid', element: <Workspace /> },
    { path: '/workspace/:wsid/video/:vid', element: <VideoReview /> },
    { path: '/video/:id', element: <VideoPage /> },
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

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Participant from './pages/Participant.jsx';
import Admin from './pages/Admin.jsx';
import './index.css';
createRoot(document.getElementById('root')).render(
  <BrowserRouter><Routes><Route path="/admin/*" element={<Admin />} /><Route path="/*" element={<Participant />} /></Routes></BrowserRouter>);

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import CreateTest from './pages/CreateTest';
import SavedTests from './pages/SavedTests';
import Dashboard from './pages/Dashboard';
import PlayTest from './pages/PlayTest';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative pb-20">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
           <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateTest />} />
              <Route path="/saved" element={<SavedTests />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/play/:id" element={<PlayTest />} />
           </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

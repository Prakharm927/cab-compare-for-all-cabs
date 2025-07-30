import React from 'react';
import CabList from './CabList';
import './index.css'; // Ensure TailwindCSS is loaded

function App() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <CabList />
    </main>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Header from './components/Header';
import ImageGenerator from './components/ImageGenerator';
import Login from './components/Login';
import TokenPurchase from './components/TokenPurchase';

function App() {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Header user={user} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={
                user ? (
                  <>
                    <h1 className="text-4xl font-bold text-center mb-8">EXPLORE</h1>
                    <p className="text-xl text-center mb-8">
                      The Cutting-Edge<br />
                      Flux Dev Image Generation Process
                    </p>
                    <ImageGenerator showAdvancedSettings={showAdvancedSettings} />
                    <button
                      className="mt-4 flex items-center justify-center w-full text-gray-300 hover:text-white"
                      onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    >
                      {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                    </button>
                    <TokenPurchase />
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
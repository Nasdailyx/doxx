import React from 'react';
import { Zap, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import TokenDisplay from './TokenDisplay';
import { useTokens } from '../hooks/useTokens';

const Header = ({ user }: { user: any }) => {
  const { tokens, loading, error, isOnline } = useTokens();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-gray-800 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Zap className="text-teal-400 mr-2" />
          <span className="text-xl font-bold">RUSHER AI</span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-teal-400">AI UPSCALE</Link></li>
            <li><Link to="/" className="hover:text-teal-400">AI VIDEO</Link></li>
            <li><Link to="/" className="hover:text-teal-400">OWN MODEL</Link></li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          {user && (
            <TokenDisplay 
              tokens={tokens} 
              loading={loading} 
              error={error}
              isOnline={isOnline}
            />
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-gray-700 p-2 rounded-full flex items-center"
            >
              <LogOut className="h-6 w-6" />
            </button>
          ) : (
            <Link to="/login" className="bg-gray-700 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Coins, WifiOff } from 'lucide-react';

interface TokenDisplayProps {
  tokens: number;
  loading?: boolean;
  error?: string | null;
  isOnline?: boolean;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ 
  tokens, 
  loading = false, 
  error = null,
  isOnline = true
}) => {
  return (
    <div className="relative flex items-center bg-gray-700 rounded-full px-3 py-1 group">
      {!isOnline && (
        <WifiOff className="text-red-400 mr-2" size={20} />
      )}
      {isOnline && (
        <Coins className="text-yellow-400 mr-2" size={20} />
      )}
      <span className="text-white font-semibold">
        {loading ? '...' : tokens.toFixed(1)}
      </span>
      {error && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-red-500 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {error}
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;
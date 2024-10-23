import React, { useState } from 'react';
import { useTokens } from '../hooks/useTokens';

const TokenPurchase: React.FC = () => {
  const { purchaseTokens } = useTokens();
  const [processing, setProcessing] = useState(false);

  const tokenPackages = [
    { tokens: 100, price: 10 },
    { tokens: 200, price: 20 },
    { tokens: 300, price: 30 },
  ];

  const handlePurchase = async (tokens: number) => {
    setProcessing(true);
    try {
      const success = await purchaseTokens(tokens);
      if (success) {
        alert('Tokens purchased successfully!');
      } else {
        alert('Failed to purchase tokens. Please try again.');
      }
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      alert('An error occurred while purchasing tokens.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Purchase Tokens</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokenPackages.map((pkg) => (
          <div key={pkg.tokens} className="bg-gray-700 p-4 rounded-lg text-center">
            <h3 className="text-xl font-semibold text-white mb-2">{pkg.tokens} Tokens</h3>
            <p className="text-teal-400 font-bold mb-4">${pkg.price}</p>
            <button
              onClick={() => handlePurchase(pkg.tokens)}
              disabled={processing}
              className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenPurchase;
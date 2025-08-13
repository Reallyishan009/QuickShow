import React, { useState } from "react";
import { CreditCard, Info, X } from "lucide-react";

const TestPaymentInfo = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to show the payment info (can be called from other components)
  const showPaymentInfo = () => {
    setIsVisible(true);
  };

  // Make this function available globally so other components can trigger it
  React.useEffect(() => {
    window.showTestPaymentInfo = showPaymentInfo;
    return () => {
      delete window.showTestPaymentInfo;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          <h3 className="font-semibold">Test Payment Info</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p className="font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Use Test Card Details:
        </p>
        <div className="bg-blue-700 p-3 rounded">
          <p>
            <strong>Card Number:</strong> 4242 4242 4242 4242
          </p>
          <p>
            <strong>Expiry:</strong> 12/34
          </p>
          <p>
            <strong>CVC:</strong> 123
          </p>
          <p>
            <strong>ZIP:</strong> 12345
          </p>
        </div>
        <p className="text-xs opacity-90">
          This is test mode. No real charges will be made.
        </p>
      </div>
    </div>
  );
};

export default TestPaymentInfo;

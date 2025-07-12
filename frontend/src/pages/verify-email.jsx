import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('Verifying...');
  const [isLoading, setIsLoading] = useState(true);
  const hasVerified = useRef(false);

  useEffect(() => {
    const verify = async () => {
      // Prevent multiple API calls
      if (!token || hasVerified.current) {
        if (!token) {
          setStatus('❌ No verification token found.');
          setIsLoading(false);
        }
        return;
      }

      hasVerified.current = true;

      try {
        setIsLoading(true);
        const res = await api.get(`/auth/verify?token=${token}`);
        
        // Access the message properly based on your API response structure
        const message = res.data?.message || res.message;
        console.log(message);
        
        toast.success('Email verified successfully!');
        setStatus('✅ Email verified successfully. You can now login.');
      } catch (error) {
        console.error('Verification error:', error);
        
        // Handle different error scenarios
        const errorMessage = error.response?.data?.message || 'Invalid or expired verification link';
        toast.error(errorMessage);
        setStatus('❌ Verification failed. The link may be invalid or expired.');
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-center max-w-md mx-auto">
      <div className="text-lg mb-4">{status}</div>
      {status.includes('✅') && (
        <a 
          href="/login" 
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go to Login
        </a>
      )}
      {status.includes('❌') && (
        <a 
          href="/register" 
          className="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Back to Register
        </a>
      )}
    </div>
  );
};

export default VerifyEmail;
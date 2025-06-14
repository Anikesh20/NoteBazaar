import { useCallback, useState } from 'react';
import { PaymentIntent } from '../types/payment';
import { useAuth } from './useAuth';

export const usePaymentService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createPaymentIntent = useCallback(async (
    noteId: string,
    amount: number
  ): Promise<PaymentIntent> => {
    if (!user) {
      throw new Error('You must be logged in to make payments');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/create-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            note_id: noteId,
            amount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.paymentIntent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment intent');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const confirmPayment = useCallback(async (
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; transactionId: string }> => {
    if (!user) {
      throw new Error('You must be logged in to confirm payments');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            payment_method_id: paymentMethodId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      const data = await response.json();
      return {
        success: data.success,
        transactionId: data.transaction_id,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm payment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getTransactionHistory = useCallback(async (
    page: number = 1,
    limit: number = 10
  ): Promise<{ transactions: any[]; total: number }> => {
    if (!user) {
      throw new Error('You must be logged in to view transaction history');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/transactions?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction history');
      }

      const data = await response.json();
      return {
        transactions: data.transactions,
        total: data.total,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getTransactionDetails = useCallback(async (
    transactionId: string
  ): Promise<any> => {
    if (!user) {
      throw new Error('You must be logged in to view transaction details');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }

      const data = await response.json();
      return data.transaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getWalletBalance = useCallback(async (): Promise<number> => {
    if (!user) {
      throw new Error('You must be logged in to view wallet balance');
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/payments/wallet/balance`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      const data = await response.json();
      return data.balance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet balance');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    createPaymentIntent,
    confirmPayment,
    getTransactionHistory,
    getTransactionDetails,
    getWalletBalance,
  };
}; 
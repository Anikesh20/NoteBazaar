import { MaterialIcons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Note } from '../types/note';
import { formatCurrency } from '../utils/formatters';

interface PaymentModalProps {
  visible: boolean;
  note: Note;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  note,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to purchase notes');
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Create a payment intent on the server
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/transactions/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            note_id: note.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, ephemeralKey, customer } = await response.json();

      // 2. Initialize the Payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'NoteBazaar',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        style: 'automatic',
      });

      if (initError) {
        throw initError;
      }

      // 3. Present the Payment Sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return;
        }
        throw presentError;
      }

      // 4. Payment successful
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Failed to process payment'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Purchase Note</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.noteInfo}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.subject}>{note.subject_name}</Text>
              
              <View style={styles.sellerInfo}>
                <MaterialIcons name="person" size={16} color="#6b7280" />
                <Text style={styles.sellerName}>{note.seller_name}</Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>
                    {note.average_rating?.toFixed(1) || 'New'}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <MaterialIcons name="download" size={16} color="#6b7280" />
                  <Text style={styles.statText}>
                    {note.download_count || 0} downloads
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentSummary}>
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Note Price</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(note.price)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Platform Fee (10%)</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(note.price * 0.1)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(note.price * 1.1)}
                </Text>
              </View>
            </View>

            <View style={styles.termsContainer}>
              <MaterialIcons name="info-outline" size={16} color="#6b7280" />
              <Text style={styles.termsText}>
                By purchasing this note, you agree to our terms of service and
                acknowledge that this is a digital product that cannot be refunded.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="payment" size={20} color="#fff" />
                  <Text style={styles.payButtonText}>
                    Pay {formatCurrency(note.price * 1.1)}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  noteInfo: {
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sellerName: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  paymentSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
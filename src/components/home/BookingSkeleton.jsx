import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Skeleton = ({style}) => {
  return (
    <LinearGradient
      colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[styles.skeleton, style]}
    />
  );
};

const BookingSkeleton = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton style={styles.bookingNumber} />
            <Skeleton style={styles.statusBadge} />
          </View>
          <View style={styles.divider} />
          <View style={styles.cardBody}>
            <Skeleton style={styles.infoRow} />
            <Skeleton style={styles.infoRow} />
            <Skeleton style={styles.infoRow} />
            <Skeleton style={styles.infoRow} />
          </View>
          <View style={styles.divider} />
          <Skeleton style={styles.seeDetails} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  bookingNumber: {
    width: 140,
    height: 20,
    borderRadius: 4,
  },
  statusBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E3E8F0',
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    marginBottom: 12,
  },
  seeDetails: {
    height: 48,
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 8,
  },
});

export default BookingSkeleton;

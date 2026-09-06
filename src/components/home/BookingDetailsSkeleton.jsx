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

const BookingDetailsSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Booking Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Skeleton style={styles.title} />
          <Skeleton style={styles.statusBadge} />
        </View>
        <View style={styles.divider} />
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <View key={i} style={styles.infoRow}>
            <Skeleton style={styles.infoLabel} />
            <Skeleton style={styles.infoValue} />
          </View>
        ))}
      </View>

      {/* Family Member Card */}
      <View style={styles.card}>
        <Skeleton style={styles.cardTitle} />
        <View style={styles.divider} />
        <View style={styles.memberCard}>
          <Skeleton style={styles.avatar} />
          <View style={styles.memberInfo}>
            <Skeleton style={styles.memberName} />
            <Skeleton style={styles.memberDetail} />
            <Skeleton style={styles.memberDetail} />
          </View>
        </View>
      </View>

      {/* Caregiver Card */}
      <View style={styles.card}>
        <Skeleton style={styles.cardTitle} />
        <View style={styles.divider} />
        <View style={styles.memberCard}>
          <Skeleton style={styles.avatar} />
          <View style={styles.memberInfo}>
            <Skeleton style={styles.memberName} />
            <Skeleton style={styles.memberDetail} />
            <Skeleton style={styles.memberDetail} />
            <Skeleton style={styles.memberDetail} />
          </View>
        </View>
        <Skeleton style={styles.bio} />
      </View>

      {/* Hospital Card */}
      <View style={styles.card}>
        <Skeleton style={styles.cardTitle} />
        <View style={styles.divider} />
        <View style={styles.memberCard}>
          <Skeleton style={styles.avatar} />
          <View style={styles.memberInfo}>
            <Skeleton style={styles.memberName} />
            <Skeleton style={styles.memberDetail} />
            <Skeleton style={styles.memberDetail} />
          </View>
        </View>
      </View>

      {/* Patient Requirements */}
      <View style={styles.card}>
        <Skeleton style={styles.cardTitle} />
        <View style={styles.divider} />
        <Skeleton style={styles.requirements} />
      </View>
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
  title: {
    width: 150,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoLabel: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  infoValue: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  cardTitle: {
    height: 20,
    width: 150,
    borderRadius: 4,
    margin: 16,
    marginBottom: 8,
  },
  memberCard: {
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    width: 120,
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  memberDetail: {
    width: 150,
    height: 14,
    borderRadius: 4,
    marginBottom: 4,
  },
  bio: {
    height: 60,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 4,
  },
  requirements: {
    height: 80,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default BookingDetailsSkeleton;

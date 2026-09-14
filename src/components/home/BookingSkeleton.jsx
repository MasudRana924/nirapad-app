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
          <View style={styles.cardTop}>
            <Skeleton style={styles.calendar} />
            <View style={styles.info}>
              <Skeleton style={styles.label} />
              <Skeleton style={styles.id} />
              <Skeleton style={styles.date} />
            </View>
            <Skeleton style={styles.badge} />
          </View>
          <Skeleton style={styles.bar} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
  },
  calendar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    width: 70,
    height: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  id: {
    width: 150,
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  date: {
    width: 110,
    height: 12,
    borderRadius: 4,
  },
  badge: {
    width: 72,
    height: 22,
    borderRadius: 11,
  },
  bar: {
    height: 36,
    width: '100%',
  },
});

export default BookingSkeleton;

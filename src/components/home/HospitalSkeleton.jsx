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

const HospitalSkeleton = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.cardContent}>
            <Skeleton style={styles.image} />
            <View style={styles.info}>
              <Skeleton style={styles.name} />
              <Skeleton style={styles.address} />
              <View style={styles.stats}>
                <Skeleton style={styles.rating} />
                <Skeleton style={styles.type} />
              </View>
            </View>
            <Skeleton style={styles.checkIcon} />
          </View>
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
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    width: 160,
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  address: {
    width: 200,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    width: 60,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  type: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default HospitalSkeleton;

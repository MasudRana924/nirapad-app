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

const FamilySkeleton = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <Skeleton style={styles.image} />
          <View style={styles.cardRight}>
            <Skeleton style={styles.name} />
            <Skeleton style={styles.relation} />
            <Skeleton style={styles.age} />
            <Skeleton style={styles.status} />
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  cardRight: {
    flex: 1,
  },
  name: {
    width: 120,
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  relation: {
    width: 80,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  age: {
    width: 100,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },
  status: {
    width: 140,
    height: 14,
    borderRadius: 4,
  },
});

export default FamilySkeleton;

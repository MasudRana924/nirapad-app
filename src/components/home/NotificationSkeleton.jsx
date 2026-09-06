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

const NotificationSkeleton = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.notificationCard}>
          <View style={styles.cardHeader}>
            <Skeleton style={styles.icon} />
            <View style={styles.headerContent}>
              <Skeleton style={styles.title} />
              <Skeleton style={styles.time} />
            </View>
          </View>
          <Skeleton style={styles.message} />
          <Skeleton style={styles.type} />
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
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    width: 150,
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  time: {
    width: 80,
    height: 12,
    borderRadius: 4,
  },
  message: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  type: {
    width: 60,
    height: 12,
    borderRadius: 4,
  },
});

export default NotificationSkeleton;

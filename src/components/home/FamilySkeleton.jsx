import React from 'react';
import {View, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Skeleton = ({style}) => (
  <LinearGradient
    colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
    style={[styles.skeleton, style]}
  />
);

/** Matches SelectFamilyMember / FamilyScreen card layout */
const FamilySkeleton = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Skeleton style={styles.avatar} />
              <Skeleton style={styles.bloodBadge} />
            </View>
            <View style={styles.userInfo}>
              <Skeleton style={styles.name} />
              <Skeleton style={styles.infoRow} />
              <Skeleton style={styles.infoRowShort} />
            </View>
          </View>
          {i !== 3 && <Skeleton style={styles.careNote} />}
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
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: '#F6F6F6',
    marginBottom: 12,
  },
  cardHeader: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 58,
    height: 58,
    position: 'relative',
    marginRight: 13,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  bloodBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 29,
    height: 18,
    borderRadius: 10,
  },
  userInfo: {
    flex: 1,
    paddingTop: 1,
  },
  name: {
    width: '70%',
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  infoRow: {
    width: '85%',
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
  },
  infoRowShort: {
    width: '55%',
    height: 12,
    borderRadius: 4,
  },
  careNote: {
    width: '100%',
    height: 72,
    borderRadius: 13,
    marginTop: 12,
  },
});

export default FamilySkeleton;

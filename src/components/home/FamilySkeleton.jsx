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
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Skeleton style={styles.avatar} />
              <Skeleton style={styles.bloodBadge} />
            </View>
            <View style={styles.userInfo}>
              <Skeleton style={styles.name} />
              <Skeleton style={styles.infoRow} />
              <Skeleton style={styles.infoRow} />
            </View>
            <Skeleton style={styles.editButton} />
          </View>

          {/* Care Note */}
          <Skeleton style={styles.careNote} />

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Skeleton style={styles.footerIcon} />
              <Skeleton style={styles.footerText} />
            </View>
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardHeader: {
    width: '100%',
    height: 81,
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
  },
  name: {
    width: 140,
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoRow: {
    width: 120,
    height: 17,
    borderRadius: 4,
    marginBottom: 4,
  },
  editButton: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  careNote: {
    width: '100%',
    height: 82,
    borderRadius: 13,
    marginTop: 10,
  },
  footer: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  footerText: {
    width: 80,
    height: 16,
    borderRadius: 4,
    marginLeft: 5,
  },
});

export default FamilySkeleton;

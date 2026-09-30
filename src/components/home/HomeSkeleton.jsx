import React, {createContext, useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const PulseContext = createContext(null);

const Bone = ({width, height, radius = 5, style}) => {
  const opacity = useContext(PulseContext);
  return (
    <Animated.View
      style={[
        styles.bone,
        {width, height, borderRadius: radius, opacity},
        style,
      ]}
    />
  );
};

const Circle = ({size, style}) => (
  <Bone width={size} height={size} radius={size / 2} style={style} />
);

const HomeSkeleton = () => {
  const pulse = useRef(new Animated.Value(0.55)).current;
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const cardWidth = (width - 32 - 12) / 2;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <PulseContext.Provider value={pulse}>
      <View style={styles.container}>
        <View style={[styles.header, {paddingTop: insets.top + 8}]}>
          <Circle size={44} style={styles.lightBone} />
          <View style={styles.brand}>
            <Bone width={110} height={16} radius={6} style={styles.lightBone} />
            <Bone width={150} height={10} radius={5} style={[styles.lightBone, styles.mt6]} />
          </View>
          <Circle size={40} style={styles.lightBone} />
          <Circle size={40} style={[styles.lightBone, styles.ml8]} />
        </View>

        <View style={styles.hero} />

        <View style={styles.sectionHead}>
          <Bone width={180} height={16} />
          <Bone width={58} height={12} />
        </View>
        <Bone width={220} height={10} style={styles.hint} />

        <View style={styles.grid}>
          {['#D7F3EA', '#FFF1DE', '#ECEEFB', '#FDE8EE'].map(color => (
            <View
              key={color}
              style={[styles.card, {width: cardWidth, backgroundColor: color}]}>
              <Circle size={36} style={styles.whiteCircle} />
              <Bone width={90} height={12} style={styles.mt10} />
              <Bone width={110} height={8} style={styles.mt6} />
              <Bone width={70} height={10} style={styles.mt12} />
            </View>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Bone width={120} height={16} />
          <Circle size={16} />
        </View>
        <Bone width={240} height={10} style={styles.hint} />
        <View style={styles.familyRow}>
          <View style={styles.familyCard}>
            <Circle size={40} />
            <View style={styles.familyCopy}>
              <Bone width={80} height={10} />
              <Bone width={60} height={8} style={styles.mt6} />
            </View>
          </View>
          <View style={[styles.familyCard, styles.addCard]}>
            <Circle size={40} />
            <View style={styles.familyCopy}>
              <Bone width={70} height={10} />
              <Bone width={84} height={8} style={styles.mt6} />
            </View>
          </View>
        </View>
      </View>
    </PulseContext.Provider>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  bone: {
    backgroundColor: '#D5E4E0',
  },
  lightBone: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  whiteCircle: {
    backgroundColor: '#FFFFFF',
  },
  mt6: {marginTop: 6},
  mt10: {marginTop: 10},
  mt12: {marginTop: 12},
  ml8: {marginLeft: 8},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C6E65',
    paddingHorizontal: 18,
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  brand: {
    flex: 1,
    marginLeft: 10,
  },
  hero: {
    marginTop: 4,
    marginHorizontal: 16,
    height: 214,
    borderRadius: 26,
    backgroundColor: '#B7DDD4',
  },
  sectionHead: {
    marginTop: 22,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    marginTop: 8,
    marginLeft: 16,
  },
  grid: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    height: 168,
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
  },
  familyRow: {
    marginTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 10,
  },
  familyCard: {
    flex: 1,
    height: 92,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  addCard: {
    borderWidth: 1.4,
    borderColor: '#D5E4E0',
    borderStyle: 'dashed',
  },
  familyCopy: {
    flex: 1,
    marginLeft: 8,
  },
});

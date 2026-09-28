import React, {createContext, useContext, useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, useWindowDimensions} from 'react-native';

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

const SCREEN_PADDING = 20;
const FAMILY_GAP = 10;

const HomeSkeleton = () => {
  const pulse = useRef(new Animated.Value(0.55)).current;
  const {width} = useWindowDimensions();
  const familyCardWidth =
    (width - SCREEN_PADDING * 2 - FAMILY_GAP * 2) / 3;

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
        <View style={styles.header}>
          <Circle size={38} />
          <View style={styles.greetingBlock}>
            <Bone width={70} height={10} />
            <Bone width={120} height={16} style={styles.mt5} />
          </View>
          <Circle size={36} />
          <Circle size={36} style={styles.ml8} />
        </View>

        <View style={styles.activeCard}>
          <View style={styles.activeTop}>
            <View style={styles.flex1}>
              <Bone width={160} height={17} />
              <Bone width={130} height={10} style={styles.mt6} />
            </View>
            <Bone width={84} height={64} radius={12} />
          </View>

          <View style={styles.steps}>
            {[100, 90, 110].map((w, index) => (
              <View
                key={w}
                style={[styles.stepRow, index > 0 && styles.mt6]}>
                <Circle size={13} />
                <Bone width={w} height={9} style={styles.ml10} />
              </View>
            ))}
          </View>

          <Bone width="100%" height={32} radius={16} style={styles.mt12} />
        </View>

        <Bone width={170} height={14} style={styles.sectionTitle} />

        <View style={styles.row}>
          {['#DDF1EB', '#FBF1D6'].map(bg => (
            <View
              key={bg}
              style={[styles.serviceCard, {backgroundColor: bg}]}>
              <View style={styles.whiteCircle} />
              <Bone width={80} height={13} style={styles.mt6} />
              <Bone width={96} height={10} style={styles.mt5} />
              <Bone width={62} height={11} style={styles.mt8} />
            </View>
          ))}
        </View>

        <View style={[styles.row, styles.mt8]}>
          {[1, 2].map(i => (
            <View key={i} style={styles.disabledTile}>
              <Circle size={18} />
              <View style={styles.disabledCopy}>
                <Bone width={70} height={9} />
                <Bone width={50} height={8} style={styles.mt4} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.familyHeader}>
          <Bone width={90} height={14} />
          <Bone width={50} height={10} />
        </View>
        <View style={styles.familyRow}>
          {[1, 2].map(i => (
            <View
              key={i}
              style={[styles.familyCard, {width: familyCardWidth}]}>
              <Circle size={30} />
              <Bone width={50} height={9} style={styles.mt6} />
              <Bone width={30} height={7} style={styles.mt4} />
            </View>
          ))}
          <View
            style={[
              styles.familyCard,
              styles.addCard,
              {width: familyCardWidth},
            ]}>
            <Circle size={26} />
            <Bone width={56} height={9} style={styles.mt6} />
          </View>
        </View>

        <Bone width={90} height={11} style={styles.recentTitle} />
        <View style={styles.recentRow}>
          <Circle size={26} />
          <View style={styles.recentCopy}>
            <Bone width={110} height={10} />
            <Bone width={80} height={8} style={styles.mt4} />
          </View>
          <Bone width={62} height={18} radius={8} />
        </View>
      </View>
    </PulseContext.Provider>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 12,
  },
  bone: {
    backgroundColor: '#DCE7E4',
  },
  flex1: {
    flex: 1,
  },
  mt4: {marginTop: 4},
  mt5: {marginTop: 5},
  mt6: {marginTop: 6},
  mt8: {marginTop: 8},
  mt12: {marginTop: 12},
  ml8: {marginLeft: 8},
  ml10: {marginLeft: 10},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greetingBlock: {
    flex: 1,
    marginLeft: 10,
  },
  activeCard: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#F2FAF8',
    borderWidth: 1,
    borderColor: '#D9ECE8',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  activeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  steps: {
    marginTop: 10,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
  },
  serviceCard: {
    width: '48.5%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  whiteCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  disabledTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E9E8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  disabledCopy: {
    marginLeft: 8,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  familyRow: {
    flexDirection: 'row',
    gap: FAMILY_GAP,
  },
  familyCard: {
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3ECEA',
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: '#C9DCD8',
  },
  recentTitle: {
    marginTop: 12,
    marginBottom: 6,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3ECEA',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recentCopy: {
    flex: 1,
    marginLeft: 8,
  },
});

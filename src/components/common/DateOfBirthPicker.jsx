import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {parseIsoDate, toIsoDate} from '../../utils/account';

const ITEM_HEIGHT = 44;
const MIN_YEAR = 1900;
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const clampToToday = (year, month, day) => {
  const today = new Date();
  const safeDay = Math.min(day, daysInMonth(year, month));
  const candidate = new Date(year, month, safeDay);
  return candidate > today
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
    : candidate;
};

const Column = ({items, selected, onSelect, isDisabled}) => {
  const scrollRef = useRef(null);
  const selectedIndex = items.findIndex(item => item.value === selected);

  useEffect(() => {
    if (selectedIndex < 0) {
      return;
    }
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, (selectedIndex - 2) * ITEM_HEIGHT),
        animated: false,
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.column}
      showsVerticalScrollIndicator={false}>
      {items.map(item => {
        const active = item.value === selected;
        const disabled = isDisabled?.(item.value);
        return (
          <TouchableOpacity
            key={item.value}
            disabled={disabled}
            style={[styles.item, active && styles.itemActive]}
            onPress={() => onSelect(item.value)}>
            <Text
              style={[
                styles.itemText,
                active && styles.itemTextActive,
                disabled && styles.itemTextDisabled,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

/**
 * Day / month / year picker for date of birth. Future dates are not allowed.
 * `value` and the confirmed result are "YYYY-MM-DD".
 */
const DateOfBirthPicker = ({visible, value, onConfirm, onClose}) => {
  const {t} = useTranslation();
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear() - 25);
  const [month, setMonth] = useState(0);
  const [day, setDay] = useState(1);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const initial = parseIsoDate(value) || new Date(today.getFullYear() - 25, 0, 1);
    setYear(initial.getFullYear());
    setMonth(initial.getMonth());
    setDay(initial.getDate());
  }, [visible, value, today]);

  const years = useMemo(() => {
    const list = [];
    for (let y = today.getFullYear(); y >= MIN_YEAR; y -= 1) {
      list.push({value: y, label: String(y)});
    }
    return list;
  }, [today]);

  const months = MONTHS.map((label, index) => ({value: index, label}));
  const days = Array.from({length: daysInMonth(year, month)}, (_, index) => ({
    value: index + 1,
    label: String(index + 1),
  }));

  const isCurrentYear = year === today.getFullYear();
  const isCurrentMonth = isCurrentYear && month === today.getMonth();

  const handleConfirm = () => {
    onConfirm(toIsoDate(clampToToday(year, month, day)));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{t('selectDateOfBirth')}</Text>
          <View style={styles.columns}>
            <Column
              items={days}
              selected={Math.min(day, days.length)}
              onSelect={setDay}
              isDisabled={d => isCurrentMonth && d > today.getDate()}
            />
            <Column
              items={months}
              selected={month}
              onSelect={setMonth}
              isDisabled={m => isCurrentYear && m > today.getMonth()}
            />
            <Column items={years} selected={year} onSelect={setYear} />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleConfirm}>
              <Text style={styles.confirmText}>{t('done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default DateOfBirthPicker;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
    textAlign: 'center',
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * 5,
    gap: 8,
  },
  column: {
    flex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: '#E6F4F3',
  },
  itemText: {
    fontSize: 16,
    color: '#5C6B7A',
  },
  itemTextActive: {
    color: '#008178',
    fontWeight: '700',
  },
  itemTextDisabled: {
    color: '#C9D2DC',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F5',
  },
  confirmButton: {
    backgroundColor: '#008178',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5C6B7A',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

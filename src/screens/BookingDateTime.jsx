import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/common/Header';
import PrimaryButton from '../components/common/PrimaryButton';
import {useAppModal} from '../contexts/ModalContext';
import {useCaregiverAvailability} from '../api/queries';
import {
  unwrapAvailability,
  slotsForDay,
  isHourInSlots,
} from '../utils/availability';

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = [
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

const formatHourLabel = hour24 => {
  const meridiem = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:00 ${meridiem}`;
};

const TIMES = Array.from({length: 24}, (_, hour) => ({
  id: hour + 1,
  hour,
  time: formatHourLabel(hour),
}));

const DURATIONS = [2, 3, 4, 5, 6, 8];

const startOfDay = date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateObject = date => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return {
    id: `${yyyy}-${mm}-${dd}`,
    day: DAY_LABELS[date.getDay()],
    month: MONTH_SHORT[date.getMonth()],
    date: dd,
    fullDate: `${yyyy}-${mm}-${dd}`,
    isToday: startOfDay(date).getTime() === startOfDay(new Date()).getTime(),
  };
};

const buildMonthCells = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay();
  const today = startOfDay(new Date());
  const cells = [];

  for (let i = 0; i < startWeekday; i++) {
    cells.push({key: `empty-${i}`, empty: true});
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isPast = startOfDay(date).getTime() < today.getTime();
    const isSunday = date.getDay() === 0;
    cells.push({
      key: `${year}-${month}-${day}`,
      day,
      date,
      isPast,
      isSunday,
      dateObj: toDateObject(date),
    });
  }

  return cells;
};

const MonthCalendar = ({selectedDate, onSelectDate}) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length < 7) {
        week.push({key: `pad-${i}-${week.length}`, empty: true});
      }
      rows.push(week);
    }
    return rows;
  }, [cells]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.navBtn}
          onPress={goPrevMonth}>
          <Icon name="chevron-back" size={20} color="#111820" />
        </TouchableOpacity>

        <View style={styles.monthTitleWrap}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.navBtnNext}
          onPress={goNextMonth}>
          <Icon name="chevron-forward" size={20} color="#008178" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEK_DAYS.map(day => (
          <View key={day} style={styles.weekCell}>
            <Text style={styles.weekLabel}>{day}</Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={`week-${weekIndex}`} style={styles.daysRow}>
          {week.map(cell => {
            if (cell.empty) {
              return <View key={cell.key} style={styles.dayCell} />;
            }

            const selected = selectedDate?.fullDate === cell.dateObj.fullDate;
            const disabled = cell.isPast;

            return (
              <TouchableOpacity
                key={cell.key}
                activeOpacity={disabled ? 1 : 0.8}
                disabled={disabled}
                style={styles.dayCell}
                onPress={() => onSelectDate(cell.dateObj)}>
                <View
                  style={[
                    styles.dayCircle,
                    selected && styles.dayCircleSelected,
                  ]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      (disabled || cell.isSunday) && styles.dayNumberMuted,
                      selected && styles.dayNumberSelected,
                    ]}>
                    {cell.day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const BookingDateTime = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {showError} = useAppModal();
  const {
    selectedMember,
    selectedCaregiver,
    selectedService,
    selectedArea,
    selectedHospital,
    serviceType,
  } = route.params || {};

  const caregiverId =
    selectedCaregiver?.id || selectedCaregiver?.uuid || null;
  const {data: availabilityData} = useCaregiverAvailability(caregiverId);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [durationHours, setDurationHours] = useState(4);
  const [notes, setNotes] = useState('');

  const availability = unwrapAvailability(availabilityData);
  const hasWeeklySlots = availability.length > 0;
  const selectedDayOfWeek = selectedDate
    ? new Date(`${selectedDate.fullDate}T00:00:00`).getDay()
    : null;
  const availableTimes = useMemo(() => {
    if (!hasWeeklySlots || selectedDayOfWeek == null) {
      return TIMES;
    }
    const daySlots = slotsForDay(availability, selectedDayOfWeek);
    return TIMES.filter(time => isHourInSlots(time.hour, daySlots));
  }, [availability, hasWeeklySlots, selectedDayOfWeek]);

  useEffect(() => {
    if (!selectedTime || !hasWeeklySlots) {
      return;
    }
    if (!availableTimes.some(time => time.id === selectedTime.id)) {
      setSelectedTime(null);
    }
  }, [availableTimes, hasWeeklySlots, selectedTime]);

  const canContinue = !!selectedDate && !!selectedTime;

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      showError('Please select date and time', 'Schedule');
      return;
    }

    navigation?.navigate('BookingPreview', {
      selectedMember,
      selectedCaregiver,
      selectedService,
      selectedArea,
      selectedHospital,
      serviceType,
      selectedDate,
      selectedTime,
      durationHours,
      notes: notes.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Header title="Book appointment" onBack={() => navigation?.goBack()} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled">
          <Text style={styles.pageHint}>
            Choose when you need the caregiver
          </Text>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Date</Text>
            <MonthCalendar
              selectedDate={selectedDate}
              onSelectDate={dateObj => {
                setSelectedDate(dateObj);
                setSelectedTime(null);
              }}
            />

            <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>
              Start time
            </Text>
            <View style={styles.timeDropdownWrap}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.timeDropdownButton,
                  timeModalOpen && styles.timeDropdownButtonOpen,
                ]}
                onPress={() => {
                  if (hasWeeklySlots && !selectedDate) {
                    showError('Please select a date first', 'Schedule');
                    return;
                  }
                  setTimeModalOpen(true);
                }}>
                <Icon name="time-outline" size={18} color="#008178" />
                <Text
                  style={[
                    styles.timeDropdownValue,
                    !selectedTime && styles.timeDropdownPlaceholder,
                  ]}>
                  {selectedTime?.time || 'Select start time'}
                </Text>
                <Icon name="chevron-down" size={18} color="#8190A7" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(hours => {
                const selected = durationHours === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    activeOpacity={0.85}
                    style={[
                      styles.durationChip,
                      selected && styles.chipSelected,
                    ]}
                    onPress={() => setDurationHours(hours)}>
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={[styles.sectionTitle, styles.notesTitle]}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write any extra details for the caregiver..."
            placeholderTextColor="#8190A7"
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={styles.bottomContainer}>
          <PrimaryButton
            title="Preview booking"
            onPress={handleNext}
            disabled={!canContinue}
          />
        </View>

        <Modal
          visible={timeModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setTimeModalOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setTimeModalOpen(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.modalSheet,
                    {paddingBottom: Math.max(insets.bottom + 12, 20)},
                  ]}>
                  <View style={styles.handleRow}>
                    <View style={styles.handle} />
                  </View>

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Start Time</Text>
                    <TouchableOpacity
                      onPress={() => setTimeModalOpen(false)}
                      style={styles.closeBtn}
                      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                      <Icon name="close" size={20} color="#8190A7" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.modalList}
                    contentContainerStyle={styles.modalListContent}
                    showsVerticalScrollIndicator={false}>
                    {availableTimes.length === 0 ? (
                      <View style={styles.noSlotsContainer}>
                        <Icon
                          name="time-outline"
                          size={36}
                          color="#C5CDD6"
                          style={styles.noSlotsIcon}
                        />
                        <Text style={styles.noSlotsText}>
                          No weekly slots on this day. Choose another date.
                        </Text>
                      </View>
                    ) : (
                      availableTimes.map((time, index) => {
                        const selected = selectedTime?.id === time.id;
                        return (
                          <TouchableOpacity
                            key={time.id}
                            activeOpacity={0.7}
                            style={[
                              styles.modalItem,
                              index === availableTimes.length - 1 &&
                                styles.modalItemLast,
                              selected && styles.modalItemSelected,
                            ]}
                            onPress={() => {
                              setSelectedTime(time);
                              setTimeModalOpen(false);
                            }}>
                            <Text
                              style={[
                                styles.modalItemText,
                                selected && styles.modalItemTextSelected,
                              ]}>
                              {time.time}
                            </Text>
                            {selected && (
                              <Icon
                                name="checkmark-circle"
                                size={20}
                                color="#008178"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BookingDateTime;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageHint: {
    fontSize: 14,
    color: '#8190A7',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111820',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  sectionTitleSpaced: {
    marginTop: 8,
  },
  calendar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingBottom: 4,
    marginBottom: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnNext: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111820',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#8190A7',
    letterSpacing: 0.2,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayCell: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#008178',
    borderRadius: 9999,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111820',
  },
  dayNumberMuted: {
    color: '#C8D0DC',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  timeDropdownWrap: {
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  timeDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
    gap: 10,
    backgroundColor: '#F6F6F6',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E8F0',
  },
  timeDropdownButtonOpen: {
    borderColor: '#008178',
  },
  timeDropdownValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111820',
  },
  timeDropdownPlaceholder: {
    fontWeight: '500',
    color: '#8190A7',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 8,
  },
  durationChip: {
    minWidth: 48,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: '#E3E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#008178',
    borderColor: '#008178',
    borderRadius: 9999,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111820',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  notesTitle: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  notesInput: {
    minHeight: 110,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3E8F0',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#111820',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: 480,
    paddingHorizontal: 20,
  },
  handleRow: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F3',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#163532',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    maxHeight: 360,
  },
  modalListContent: {
    paddingBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F3',
  },
  modalItemLast: {
    borderBottomWidth: 0,
  },
  modalItemSelected: {
    backgroundColor: '#F3FAF7',
    borderRadius: 10,
    marginHorizontal: -4,
    paddingHorizontal: 14,
  },
  modalItemText: {
    fontSize: 15,
    color: '#111820',
    fontWeight: '500',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#008178',
    fontWeight: '700',
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  noSlotsIcon: {
    marginBottom: 8,
  },
  noSlotsText: {
    fontSize: 14,
    color: '#8190A7',
    textAlign: 'center',
    lineHeight: 20,
  },
});


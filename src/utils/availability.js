const toHour = value => {
  if (value == null || value === '') {
    return null;
  }
  const match = String(value).match(/(\d{1,2})/);
  if (!match) {
    return null;
  }
  const hour = parseInt(match[1], 10);
  return Number.isNaN(hour) ? null : hour;
};

export const unwrapAvailability = payload => {
  const data = payload?.data !== undefined ? payload.data : payload;
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.availability)) {
    return data.availability;
  }
  if (Array.isArray(data?.slots)) {
    return data.slots;
  }
  return [];
};

export const slotsForDay = (availability, dayOfWeek) => {
  const list = Array.isArray(availability) ? availability : [];
  return list.filter(item => {
    const day = item?.day_of_week ?? item?.dayOfWeek;
    return Number(day) === Number(dayOfWeek);
  });
};

export const isHourInSlots = (hour, slots) => {
  if (!Array.isArray(slots) || slots.length === 0) {
    return false;
  }

  return slots.some(slot => {
    if (slot?.is_available === false || slot?.available === false) {
      return false;
    }
    const nested = Array.isArray(slot.slots) ? slot.slots : [slot];
    return nested.some(entry => {
      if (entry?.is_available === false || entry?.available === false) {
        return false;
      }
      const start = toHour(entry.start_time || entry.start || entry.from);
      const end = toHour(entry.end_time || entry.end || entry.to);
      if (start == null || end == null) {
        return true;
      }
      return hour >= start && hour < end;
    });
  });
};

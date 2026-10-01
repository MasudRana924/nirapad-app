export const GENDERS = ['male', 'female', 'other'];

export const GENDER_LABEL_KEYS = {
  male: 'genderMale',
  female: 'genderFemale',
  other: 'genderOther',
};

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const PHOTO_MIME_BY_EXT = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const ALLOWED_PHOTO_MIME = new Set(Object.values(PHOTO_MIME_BY_EXT));

/** Picker options that keep photos well under the 5MB upload limit. */
export const PHOTO_PICKER_OPTIONS = {
  mediaType: 'photo',
  quality: 0.85,
  maxWidth: 1600,
  maxHeight: 1600,
  selectionLimit: 1,
  includeExtra: false,
};

/** Normalise an image-picker asset into {uri, name, type, size}. */
export const photoFromAsset = asset => {
  const fallbackName = 'avatar.jpg';
  const name = asset?.fileName || fallbackName;
  const ext = String(name).split('.').pop().toLowerCase();
  let type = String(asset?.type || PHOTO_MIME_BY_EXT[ext] || '').toLowerCase();
  if (type === 'image/jpg') {
    type = 'image/jpeg';
  }
  return {
    uri: asset?.uri,
    name,
    type,
    size: Number(asset?.fileSize || 0),
  };
};

/** Returns an error key for i18n, or null when the photo can be uploaded. */
export const validatePhoto = photo => {
  if (!photo?.uri || !ALLOWED_PHOTO_MIME.has(photo.type)) {
    return 'photoInvalidType';
  }
  if (photo.size > PHOTO_MAX_BYTES) {
    return 'photoTooLarge';
  }
  return null;
};

const pad = value => String(value).padStart(2, '0');

export const toIsoDate = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Parse "YYYY-MM-DD" as a local date (no timezone shift). */
export const parseIsoDate = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
  if (!match) {
    return null;
  }
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "1995-04-20" -> "20 Apr 1995" */
export const formatDateOfBirth = value => {
  const date = parseIsoDate(value);
  if (!date) {
    return null;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

let pendingProfileToast = null;

/** Queue a toast for the Profile screen to show on its next focus. */
export const setPendingProfileToast = message => {
  pendingProfileToast = message;
};

export const takePendingProfileToast = () => {
  const message = pendingProfileToast;
  pendingProfileToast = null;
  return message;
};

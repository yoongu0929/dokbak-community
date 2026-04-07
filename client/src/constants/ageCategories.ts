export const AGE_CATEGORIES = [
  { value: 'newborn', label: '신생아 (0~6개월)', emoji: '👶' },
  { value: 'infant', label: '영아 (6~12개월)', emoji: '🍼' },
  { value: 'toddler', label: '유아 (1~3세)', emoji: '🧒' },
  { value: 'preschool', label: '미취학 (4~6세)', emoji: '🎨' },
  { value: 'school', label: '초등 (7세 이상)', emoji: '🎒' },
] as const;

export const AGE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(
  AGE_CATEGORIES.map((c) => [c.value, `${c.emoji} ${c.label}`])
);

export const FACILITY_OPTIONS = [
  { key: 'hasNursingRoom', label: '🤱 수유실' },
  { key: 'hasDiaperStation', label: '🚼 기저귀 교환대' },
  { key: 'hasStrollerAccess', label: '🛒 유모차 접근 가능' },
  { key: 'hasKidsMenu', label: '🍽️ 키즈 메뉴' },
  { key: 'hasPlayground', label: '🛝 놀이시설' },
] as const;

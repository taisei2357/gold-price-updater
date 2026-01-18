// app/models/scheduler.server.ts
// JSTでの祝日・平日・実行可否判定ユーティリティ（2024–2027対応）

const HOLIDAYS_JP = new Set<string>([
  // 2024
  "2024-01-01", // 元日
  "2024-01-08", // 成人の日
  "2024-02-11", // 建国記念の日
  "2024-02-12", // 建国記念の日 振替
  "2024-02-23", // 天皇誕生日
  "2024-03-20", // 春分の日
  "2024-04-29", // 昭和の日
  "2024-05-03", // 憲法記念日
  "2024-05-04", // みどりの日
  "2024-05-05", // こどもの日
  "2024-05-06", // こどもの日 振替
  "2024-07-15", // 海の日
  "2024-08-11", // 山の日
  "2024-08-12", // 山の日 振替
  "2024-09-16", // 敬老の日
  "2024-09-22", // 秋分の日
  "2024-09-23", // 秋分の日 振替
  "2024-10-14", // スポーツの日
  "2024-11-03", // 文化の日
  "2024-11-04", // 文化の日 振替
  "2024-11-23", // 勤労感謝の日

  // 2025
  "2025-01-01", // 元日
  "2025-01-13", // 成人の日
  "2025-02-11", // 建国記念の日
  "2025-02-23", // 天皇誕生日
  "2025-02-24", // 天皇誕生日 振替
  "2025-03-20", // 春分の日
  "2025-04-29", // 昭和の日
  "2025-05-03", // 憲法記念日
  "2025-05-04", // みどりの日
  "2025-05-05", // こどもの日
  "2025-05-06", // みどりの日 振替
  "2025-07-21", // 海の日
  "2025-08-11", // 山の日
  "2025-09-15", // 敬老の日
  "2025-09-23", // 秋分の日
  "2025-10-13", // スポーツの日
  "2025-11-03", // 文化の日
  "2025-11-23", // 勤労感謝の日

  // 2026
  "2026-01-01", // 元日
  "2026-01-02", // 振替休日（元日の振替）
  "2026-01-03", // 三が日（田中貴金属サイト更新なし）
  "2026-01-12", // 成人の日
  "2026-02-11", // 建国記念の日
  "2026-02-23", // 天皇誕生日
  "2026-03-20", // 春分の日
  "2026-04-29", // 昭和の日
  "2026-05-03", // 憲法記念日
  "2026-05-04", // みどりの日
  "2026-05-05", // こどもの日
  "2026-05-06", // 振替休日
  "2026-07-20", // 海の日
  "2026-08-11", // 山の日
  "2026-09-21", // 敬老の日
  "2026-09-22", // 秋分の日（振替休日）
  "2026-09-23", // 秋分の日
  "2026-10-12", // スポーツの日
  "2026-11-03", // 文化の日
  "2026-11-23", // 勤労感謝の日

  // 2027
  "2027-01-01", // 元日
  "2027-01-02", // 三が日（田中貴金属サイト更新なし）
  "2027-01-03", // 三が日（田中貴金属サイト更新なし）
  "2027-01-11", // 成人の日
  "2027-02-11", // 建国記念の日
  "2027-02-23", // 天皇誕生日
  "2027-03-21", // 春分の日
  "2027-04-29", // 昭和の日
  "2027-05-03", // 憲法記念日
  "2027-05-04", // みどりの日
  "2027-05-05", // こどもの日
  "2027-07-19", // 海の日
  "2027-08-11", // 山の日
  "2027-09-20", // 敬老の日
  "2027-09-23", // 秋分の日
  "2027-10-11", // スポーツの日
  "2027-11-03", // 文化の日
  "2027-11-23", // 勤労感謝の日
]);

/**
 * UTC日時をJST（日本標準時）に変換
 */
function toJST(utcDate: Date = new Date()): Date {
  return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * 指定日時（JST）が日本の祝日かどうか判定
 */
export function isJapanHolidayJST(date: Date = new Date()): boolean {
  const jst = toJST(date);
  const dateStr = jst.toISOString().split('T')[0]; // YYYY-MM-DD
  return HOLIDAYS_JP.has(dateStr);
}

/**
 * 指定日時（JST）が週末（土日）かどうか判定
 */
export function isWeekendJST(date: Date = new Date()): boolean {
  const jst = toJST(date);
  const dayOfWeek = jst.getDay(); // 0=日曜, 6=土曜
  return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * 指定日時（JST）が営業日（平日かつ非祝日）かどうか判定
 */
export function isBusinessDayJST(date: Date = new Date()): boolean {
  return !isWeekendJST(date) && !isJapanHolidayJST(date);
}

/**
 * 現在時刻（JST）が自動実行すべき時間かどうか判定
 * @param targetHour 実行対象時刻（デフォルト：10時）
 */
export function shouldRunNowJST(targetHour: number = 10, date: Date = new Date()): boolean {
  if (!isBusinessDayJST(date)) return false;
  
  const jst = toJST(date);
  return jst.getHours() === targetHour;
}

/**
 * 次回実行予定時刻を取得（JST）
 * @param targetHour 実行対象時刻（デフォルト：10時）
 */
export function getNextExecutionTimeJST(targetHour: number = 10, from: Date = new Date()): Date {
  let next = toJST(from);
  
  // 翌日から開始
  next.setDate(next.getDate() + 1);
  next.setHours(targetHour, 0, 0, 0);
  
  // 営業日まで進める
  while (!isBusinessDayJST(next)) {
    next.setDate(next.getDate() + 1);
  }
  
  return next;
}

// named & default 両対応
export default {
  isJapanHolidayJST,
  isWeekendJST,
  isBusinessDayJST,
  shouldRunNowJST,
  getNextExecutionTimeJST
};
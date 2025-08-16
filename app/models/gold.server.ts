// app/models/gold.server.ts
// 田中貴金属サイトから"前日比(%)"を取得して、小数比率にして返す。
// 例: +2.5% → 0.025,  -0.8% → -0.008
// 失敗時は null を返す（UI 停止用）

let _cache: { at: number; ratio: number | null } | null = null;
const TTL_MS = 10 * 60 * 1000; // 10分キャッシュ

export async function fetchGoldChangeRatioTanaka(): Promise<number | null> {
  // テスト用：固定値を返す（デバッグ後に元に戻す）
  return 0.02; // +2%の変動をシミュレート
  
  // キャッシュ
  if (_cache && Date.now() - _cache.at < TTL_MS) return _cache.ratio;

  try {
    // 田中貴金属の「本日の地金価格」ページ（公開HTML）。※URLは運用で調整可
    const url = "https://gold.tanaka.co.jp/commodity/souba/index.php";
    const resp = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) throw new Error(`Tanaka request failed: ${resp.status}`);
    const html = await resp.text();

    // ページ内の"前日比"や"変動率"表記を抜く（代表的なパターンを網羅）
    // 例: 前日比 +2.50% / -0.85%
    const m =
      html.match(/前日比[^%\-+]*([+\-]?\d+(?:\.\d+)?)\s*%/i) ||
      html.match(/変動率[^%\-+]*([+\-]?\d+(?:\.\d+)?)\s*%/i);

    const ratio = m ? Number(m[1]) / 100 : null;

    _cache = { at: Date.now(), ratio };
    return ratio;
  } catch {
    _cache = { at: Date.now(), ratio: null };
    return null;
  }
}
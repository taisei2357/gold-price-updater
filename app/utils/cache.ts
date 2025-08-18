// フロントエンド用キャッシュユーティリティ

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class ClientCache {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分
  
  static set<T>(key: string, data: T, ttl = ClientCache.DEFAULT_TTL): void {
    if (typeof window === 'undefined') return; // SSR対応
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      // ストレージ容量制限やプライベートモードでのエラー対応
      console.warn('キャッシュ保存に失敗（Shopify認証影響なし）:', error);
    }
  }
  
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null; // SSR対応
    
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      const item: CacheItem<T> = JSON.parse(stored);
      
      // 期限切れチェック
      if (Date.now() > item.expiresAt) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('キャッシュ取得に失敗:', error);
      sessionStorage.removeItem(key);
      return null;
    }
  }
  
  static clear(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }
  
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  }
  
  static isExpired(key: string): boolean {
    if (typeof window === 'undefined') return true;
    
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return true;
      
      const item: CacheItem<any> = JSON.parse(stored);
      return Date.now() > item.expiresAt;
    } catch {
      return true;
    }
  }
  
  static getInfo(key: string): { timestamp: number; expiresAt: number } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) return null;
      
      const item: CacheItem<any> = JSON.parse(stored);
      return {
        timestamp: item.timestamp,
        expiresAt: item.expiresAt
      };
    } catch {
      return null;
    }
  }
}

// 商品データ専用のキャッシュキー
export const CACHE_KEYS = {
  PRODUCTS: 'shopify_products_cache',
  PRODUCT_SELECTION: 'product_selection_cache'
} as const;
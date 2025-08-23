-- Remove autoUpdateHour field from ShopSetting (JST 10:00 fixed)
ALTER TABLE "ShopSetting" DROP COLUMN "autoUpdateHour";
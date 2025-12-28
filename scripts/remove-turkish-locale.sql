-- Скрипт для удаления всех турецких (tr) локализаций из базы данных
-- Запустить на сервере после деплоя новой версии кода

-- Удаление турецких названий продуктов
DELETE FROM product_names WHERE locale = 'tr';

-- Удаление турецких описаний
DELETE FROM descriptions WHERE locale = 'tr';

-- Удаление турецких характеристик
DELETE FROM features WHERE locale = 'tr';

-- Удаление турецких цветов
DELETE FROM product_colors WHERE locale = 'tr';

-- Удаление турецких коллекций
DELETE FROM product_collections WHERE locale = 'tr';

-- Удаление турецких стилей
DELETE FROM product_styles WHERE locale = 'tr';

-- Проверка: подсчет оставшихся записей по локалям
SELECT 'product_names' as table_name, locale, COUNT(*) as count FROM product_names GROUP BY locale
UNION ALL
SELECT 'descriptions' as table_name, locale, COUNT(*) as count FROM descriptions GROUP BY locale
UNION ALL
SELECT 'features' as table_name, locale, COUNT(*) as count FROM features GROUP BY locale
UNION ALL
SELECT 'product_colors' as table_name, locale, COUNT(*) as count FROM product_colors GROUP BY locale
UNION ALL
SELECT 'product_collections' as table_name, locale, COUNT(*) as count FROM product_collections GROUP BY locale
UNION ALL
SELECT 'product_styles' as table_name, locale, COUNT(*) as count FROM product_styles GROUP BY locale
ORDER BY table_name, locale;

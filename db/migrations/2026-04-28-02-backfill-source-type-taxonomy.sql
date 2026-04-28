update sources
set source_type = 'xiaohongshu_public_url'
where source_type::text = 'xiaohongshu';

update raw_items
set source_type = 'xiaohongshu_public_url'
where source_type::text = 'xiaohongshu';

update signals
set source_type = 'xiaohongshu_public_url'
where source_type::text = 'xiaohongshu';

update sources
set source_type = 'official_site'
where source_type::text in ('website', 'wechat');

update raw_items
set source_type = 'official_site'
where source_type::text in ('website', 'wechat');

update signals
set source_type = 'official_site'
where source_type::text in ('website', 'wechat');

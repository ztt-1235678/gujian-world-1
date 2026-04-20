const express = require('express');
const router = express.Router();

const knowledgeArticles = [
  { id: 1, title: '庑殿顶——皇家气度', category: '屋顶', dynasty: '周-清', content: '庑殿顶是中国古代建筑中等级最高的屋顶形式，由一条正脊和四条垂脊组成，四面斜坡，又称“五脊殿”。《周礼·考工记》载：“商人四阿重屋”，四阿即庑殿顶的雏形。多用于皇宫、庙宇主殿，如故宫太和殿。', details: '庑殿顶的屋檐曲线流畅，既利于排水又显庄重。唐代以前常见，明清成为皇家专属。日本、韩国等东亚古建筑也受其影响。', originalText: '《营造法式》卷五：“造四阿殿阁，其转角升项，令举势和协。”', tags: ['屋顶', '皇家'], difficulty: 1 },
  { id: 2, title: '歇山顶——典雅平衡', category: '屋顶', dynasty: '汉-清', content: '歇山顶由一条正脊、四条垂脊和四条戗脊组成，共九脊，上部如悬山，下部如庑殿，形态优美。汉代明器已见雏形，宋代称“九脊殿”。常用于宫殿、园林、寺庙，如天安门、保和殿。', details: '歇山顶的屋檐转折丰富，视觉效果轻盈。南方多雨地区常见，利于通风。侧面形成的三角形山花板常饰以吉祥图案。', originalText: '《营造法式》卷五：“九脊殿，亦曰歇山。”', tags: ['屋顶', '园林'], difficulty: 1 },
  { id: 3, title: '悬山顶——山野清风', category: '屋顶', dynasty: '汉-清', content: '悬山顶是两侧山墙悬挑出屋檐的屋顶形式，利于遮雨，多见于南方民居和山林建筑。《营造法式》称为“不厦两头造”。等级低于歇山顶，高于硬山顶。', details: '悬山顶的山面常饰以悬鱼、惹草等木雕装饰，寓意防火。', originalText: '《营造法式》卷五：“不厦两头造，两头各出际，谓之悬山。”', tags: ['屋顶', '民居'], difficulty: 1 },
  { id: 4, title: '硬山顶——朴实无华', category: '屋顶', dynasty: '明-清', content: '硬山顶是山墙与屋面齐平的屋顶形式，防火性能好，广泛用于北方民居。明代以后随砖石技术成熟而普及。', details: '硬山顶等级较低，但砖雕山花十分精美。山西大院多采用硬山顶。', originalText: '《清式营造则例》：“硬山，两山墙与屋面齐平。”', tags: ['屋顶', '民居'], difficulty: 1 },
  { id: 5, title: '攒尖顶——亭台高耸', category: '屋顶', dynasty: '南北朝-清', content: '攒尖顶是所有屋面交汇于顶点的屋顶形式，多用于亭、塔、阁楼。天坛祈年殿即三重檐攒尖顶，蓝色琉璃瓦象征天。', details: '攒尖顶有圆形、方形、六角、八角等变化，顶端常饰以宝顶。', originalText: '《园冶》：“亭者，停也，所以停憩游行也。”', tags: ['屋顶', '亭'], difficulty: 1 },
  { id: 6, title: '斗拱——木构之魂', category: '斗拱', dynasty: '战国-清', content: '斗拱是中国古建筑特有的结构构件，由斗、拱、昂等组成，位于柱顶与屋檐之间。它承托屋檐重量，传递荷载，同时是等级标志。应县木塔使用54种斗拱，堪称“斗拱博物馆”。', details: '斗拱最早出现于战国铜器上的建筑纹样，汉代明器已有成熟形态。唐代佛光寺斗拱雄大，明清则趋于繁密装饰。', originalText: '《营造法式》卷四：“造栱之制有五：一曰华栱，二曰泥道栱，三曰瓜子栱，四曰令栱，五曰慢栱。”', tags: ['斗拱', '结构'], difficulty: 2 },
  { id: 7, title: '铺作——材分模数', category: '斗拱', dynasty: '宋', content: '“铺作”是宋代对斗拱的称呼，一朵斗拱即为一铺作。从四铺作至八铺作，等级逐增。《营造法式》以“材”为基本模数，分八等，用于不同规模建筑。', details: '“材”高15分，宽10分；“栔”高6分，宽4分。一材一栔谓之“足材”。', originalText: '《营造法式》卷四：“凡铺作，自柱头上栌斗算起，每跳为一铺作。”', tags: ['斗拱', '模数'], difficulty: 2 },
  { id: 8, title: '应县木塔——千年不倒', category: '著名古建', dynasty: '辽', content: '佛宫寺释迦塔（应县木塔）建于辽清宁二年（1056年），高67.31米，是世界现存最高最古老木塔。全塔无钉无铆，使用3000立方米红松，经历40余次地震仍屹立。', details: '木塔采用双层筒体结构，暗层中斜撑形成刚体。民国时遭炮弹仍不倒。', originalText: '《应州志》：“释迦塔，在佛宫寺，辽清宁二年田和尚奉敕建。”', tags: ['塔', '奇迹'], difficulty: 2 },
  { id: 9, title: '佛光寺——唐代遗珍', category: '著名古建', dynasty: '唐', content: '五台山佛光寺东大殿建于唐大中十一年（857年），是中国现存最完整的唐代木构建筑。梁思成先生称为“中国第一国宝”。', details: '大殿面阔七间，进深四间，斗拱雄大，出檐深远，尽显唐风。', originalText: '梁思成《中国建筑史》：“佛光寺一役，使吾人得以一睹唐代建筑之真实面目。”', tags: ['寺庙', '唐代'], difficulty: 2 },
  { id: 10, title: '故宫太和殿——金銮宝殿', category: '著名古建', dynasty: '明-清', content: '太和殿是故宫等级最高的建筑，重檐庑殿顶，面阔十一间，高35.05米，是现存最大的木构建筑。', details: '殿内金柱、藻井、屏风、宝座极尽奢华，体现皇权至上的思想。', originalText: '《明史》：“永乐十五年，建北京宫殿。”', tags: ['宫殿', '皇家'], difficulty: 2 },
  { id: 11, title: '雀替——梁上华章', category: '装饰', dynasty: '北魏-清', content: '雀替位于梁柱交接处，起加固和装饰作用。明清时期雕刻精美，题材包括龙凤、花鸟、人物故事。徽派建筑中的木雕雀替尤其著名。', details: '雀替最早见于北魏，宋代称“角替”。浙东牛腿也是类似构件。', originalText: '《清式营造则例》：“雀替，位于梁与柱相交处，以承托梁头。”', tags: ['装饰', '木雕'], difficulty: 1 },
  { id: 12, title: '藻井——天穹之眼', category: '内部装修', dynasty: '汉-清', content: '藻井是宫殿、寺庙天花板上的穹窿状装饰，常用斗拱、木雕层层叠架，中心绘龙或星辰。故宫太和殿的蟠龙藻井最为华丽。', details: '藻井象征天宇，有“厌胜”防火之意。早期多为方形，后演变为八角、圆形。', originalText: '《西京赋》：“蒂倒茄于藻井，披红葩之狎猎。”', tags: ['内部', '装饰'], difficulty: 2 },
  { id: 13, title: '鸱吻——龙子避火', category: '装饰', dynasty: '汉-清', content: '鸱吻是屋顶正脊两端的装饰构件，传说为龙子，能避火。早期为鱼尾形，明清演变为龙形。', details: '唐代鸱吻简洁雄壮，明清繁复华丽。', originalText: '《唐会要》：“汉柏梁殿灾，越巫言海中有鱼虬，尾似鸱，激浪即降雨，遂作其像于屋上。”', tags: ['装饰', '瑞兽'], difficulty: 1 },
  { id: 14, title: '苏州园林——壶中天地', category: '园林', dynasty: '宋-清', content: '苏州园林是中国古典园林的代表，以“咫尺山林”手法在有限空间内营造自然意境。拙政园、留园等被列为世界文化遗产。', details: '园林讲究“虽由人作，宛自天开”，叠山、理水、建筑、花木巧妙结合。', originalText: '计成《园冶》：“虽由人作，宛自天开。”', tags: ['园林', '意境'], difficulty: 2 },
  { id: 15, title: '徽派建筑——粉墙黛瓦', category: '民居', dynasty: '明-清', content: '徽派建筑以马头墙、天井、砖木石雕为特色，集中分布于安徽、江西。白墙黑瓦，高低错落，防火防盗，体现儒家宗族观念。', details: '宏村、西递是典型代表。天井用于采光排水，马头墙起防火隔断作用。', originalText: '《歙县志》：“徽州之宅，多高楼，以防火患。”', tags: ['民居', '徽派'], difficulty: 1 },
  { id: 16, title: '闽南建筑——燕尾脊', category: '民居', dynasty: '宋-清', content: '闽南建筑以燕尾脊、红砖墙、石雕为特色，屋顶两端翘起如燕尾，装饰华丽。泉州开元寺、厦门南普陀为代表。', details: '燕尾脊象征“归燕还巢”，有思乡之意。红砖墙因当地红土烧制，色彩鲜艳。', originalText: '《闽书》：“泉俗，屋脊翘如燕尾，谓之燕仔脊。”', tags: ['民居', '闽南'], difficulty: 1 },
  { id: 17, title: '岭南建筑——镬耳墙', category: '民居', dynasty: '明-清', content: '岭南建筑以镬耳墙、灰塑、木雕为特色，镬耳墙形似锅耳，防火且象征官帽。广州陈家祠、佛山祖庙为代表。', details: '镬耳墙又称“鳌鱼墙”，寓意“独占鳌头”。灰塑工艺精美，色彩艳丽。', originalText: '《广东新语》：“岭南屋脊，左右起镬耳，以象官帽。”', tags: ['民居', '岭南'], difficulty: 1 },
  { id: 18, title: '《营造法式》——天工开物', category: '典籍', dynasty: '宋', content: '北宋李诫编修的《营造法式》于1103年刊行，全书34卷，建立“材分”模数制，规范了设计、施工、材料、工限。是古建筑修复的核心依据。', details: '1930年代朱启钤重新发现该书，梁思成等人研究并用于实地测绘。', originalText: '李诫《营造法式序》：“适值《营造法式》镂版已毕，前所未有。”', tags: ['典籍', '模数'], difficulty: 3 },
  { id: 19, title: '飞檐翘角——如翚斯飞', category: '屋顶', dynasty: '汉-清', content: '飞檐是中国古建筑屋顶转角处的上翘结构，既利于采光排水，又增添轻盈美感。《诗经》云“如鸟斯革，如翚斯飞”，正是形容飞檐。', details: '南方建筑飞檐高翘，北方较为平缓。飞檐下常有“角梁”、“仔角梁”支撑。', originalText: '《诗经》：“如鸟斯革，如翚斯飞。”', tags: ['屋顶', '装饰'], difficulty: 1 },
  { id: 20, title: '柱础——承托之基', category: '构件', dynasty: '周-清', content: '柱础是柱子底部的石墩，防潮防腐蚀，常雕刻莲瓣、兽纹。宋代《营造法式》详载造柱础之制。', details: '早期柱础素平，南北朝受佛教影响出现莲瓣纹，明清样式丰富。', originalText: '《营造法式》卷三：“造柱础之制：其方倍柱之径。”', tags: ['构件', '石雕'], difficulty: 1 }
];

const knowledgeCards = [
  { id: 1, title: '鸱吻', content: '屋顶正脊两端的装饰构件，传说能避火。早期为鱼尾形，明清演变为龙形。' },
  { id: 2, title: '铺作', content: '斗拱在宋代称为“铺作”，一朵斗拱即为一铺作。' },
  { id: 3, title: '月梁', content: '弯曲如月牙的梁，常见于南方建筑，美观且受力好。' },
  { id: 4, title: '柱础', content: '柱子底部的石墩，防潮防腐蚀，常雕刻莲瓣、兽纹。' },
  { id: 5, title: '罩', content: '室内分隔空间的落地罩、飞罩，常用木雕，精致通透。' },
  { id: 6, title: '悬鱼', content: '悬山顶山面垂下的木雕装饰，常为鱼形，寓意防火。' },
  { id: 7, title: '抱鼓石', content: '门枕石外侧的抱鼓形装饰，雕刻精美，象征宅第等级。' }
];

router.get('/articles', (req, res) => {
  let { category, page = 1, limit = 6 } = req.query;
  let articles = [...knowledgeArticles];
  if (category && category !== 'all') articles = articles.filter(a => a.category === category);
  const start = (page - 1) * limit;
  const paginated = articles.slice(start, start + limit);
  res.json({ articles: paginated, total: articles.length, totalPages: Math.ceil(articles.length / limit) });
});

router.get('/cards', (req, res) => {
  res.json(knowledgeCards);
});

router.get('/article/:id', (req, res) => {
  const article = knowledgeArticles.find(a => a.id == req.params.id);
  article ? res.json(article) : res.status(404).json({ error: '未找到' });
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(knowledgeArticles.map(a => a.category))];
  res.json(categories);
});

module.exports = router;
# 素材记录

新增素材使用 OpenAI 内置 Imagegen 工具生成，未使用 API/CLI 模式。图像生成后已复制并优化到项目，不依赖会话缓存路径。

## 儿童活动照片

保存位置：`public/images/hero.jpg`、`sports.jpg`、`art.jpg`、`nature.jpg`、`festival.jpg`。均为虚构儿童的示例照片，不代表真实儿童或园所。

实际提示词：

- **hero**: A candid close-up portrait of a cheerful Chinese kindergarten girl age 5, wearing a yellow bucket hat and white short sleeve school polo with blue piping and a small rainbow badge, looking up and laughing, outdoors in a lush green sunny kindergarten courtyard, shallow depth of field, warm daylight, joyful natural documentary photography, landscape 4:3 composition, no text no frame. Fictional child for an illustrative kindergarten memory website.
- **sports**: A cheerful Chinese kindergarten boy age 5 wearing a white school polo with blue piping and navy blue shorts, running toward camera on a grassy playground with two other children smiling behind him, bright leafy sunny Chinese kindergarten campus, candid editorial lifestyle photo, vivid natural greens and warm sunlight, landscape 4:3, no text no frame. Fictional children for illustrative kindergarten memory website.
- **art**: Candid natural photography of a Chinese kindergarten girl age 5 with black ponytail, white school polo with blue piping, at an outdoor wooden easel painting a colorful picture with a brush, leafy kindergarten courtyard and other children softly blurred behind, sunny warm daylight, landscape 4:3, no text no frame. Fictional children for illustrative kindergarten memory website.
- **nature**: A Chinese kindergarten boy and girl age 5 in white school polo shirts with blue piping exploring plants with a big magnifying glass in a beautiful sunny green garden, heads close together, delighted curious expressions, candid natural documentary photograph, lush bokeh, landscape 4:3, no text no frame. Fictional children for illustrative kindergarten memory website.
- **festival**: Two cheerful Chinese kindergarten children age 5 wearing white chef hats and white school polos with blue piping, laughing while holding golden mooncakes in sunny outdoor kindergarten autumn celebration, warm yellow and green foliage bokeh, candid editorial lifestyle photography, landscape 4:3, no text no frame. Fictional children for illustrative kindergarten memory website.

## 蜡笔贴纸

保存位置：`public/illustrations/stickers.png`。生成时以用户提供的《彩色蜡笔童趣探索贴纸集.png》作为风格参考，使用真实透明通道。网页仅显示独立贴纸格子，未将整张页面设计用作背景。

实际提示词：

Generate ONE production-ready sprite sheet image asset for a children's kindergarten scrapbook website. The supplied image is STYLE REFERENCE ONLY. Recreate these thick, vividly colored wax-crayon hand-drawn stickers with visible rough wax strokes, white flecks, uneven childlike edges. CRITICAL: genuinely TRANSPARENT background, no colored haze, no shadows outside objects, no text. Layout exactly a regular 4-column by 4-row grid of 16 equally sized SQUARE cells, total square image. Each icon must be fully contained and centered in its own cell with 12% transparent padding, never overlapping. Row 1 left to right: yellow sunrise above short blue wave; rainbow with two blue white clouds; yellow-sailed blue boat; red white lighthouse on tiny green hill. Row 2: adorable smiling little astronaut sitting on yellow moon; red white blue rocket pointing northeast with flame; orange Saturn with yellow ring; purple crater moon. Row 3: blue turquoise striped planet with tilted pale yellow ring; blue green Earth with two small clouds; yellow five-point star; purple spiral galaxy. Row 4: painter palette with brush; golden trophy; blue magnifying glass with brown handle; green seedling with two leaves. Match the reference sticker illustration aesthetic closely, bright colors rather than muted pastel. Asset type sprite sheet, not a complete website design.

## 继承的静物素材

- `beach.jpg`: https://images.unsplash.com/photo-1507525428034-b723cf961d3e
- `garden.jpg`: https://images.unsplash.com/photo-1416879595882-3373a0480b5b
- `paint.jpg`: https://images.unsplash.com/photo-1513364776144-60967b0f800f

字体 ZCOOL KuaiLe 来自 Google Fonts 官方仓库，使用 SIL Open Font License。`public/fonts/OFL.txt` 保留许可证。

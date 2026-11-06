---
title: 俯视视角与四向移动
description: 哈佛 CS50G Week 5 · 俯视视角与四向移动
---

# 俯视视角与四向移动

横版游戏把重力写进 Y 轴，俯视游戏把两个轴都还给玩家，代价是四个方向的动画、判定和边界都要各写一遍。

## 视角的差别

俯视不等于把摄像机抬高，区别在自由度：平台跳跃里 Y 是跳跃的副产物，俯视里 X 与 Y 都是可行走方向。

| 维度     | 横版卷轴   | 俯视           |
| -------- | ---------- | -------------- |
| Y 轴含义 | 重力与跳跃 | 上下行走       |
| 方向数   | 左右 2     | 上下左右 4     |
| 碰撞对象 | 砖块、地面 | 房间边界、实体 |
| 地图单位 | 关卡       | 房间           |

课程用的是纯正交俯视，不做等距斜投影。墙的上沿用偏亮的图块、下沿用偏暗的图块，靠配色伪造高度感，玩家会自动读成光源在上方。

## 贴图与绘制偏移

LÖVE 的绘制锚点在左上角。走路图集每格 16×32，持剑图集每格 32×32，人物在格子里偏下，所以进入挥剑状态要改绘制偏移。

```lua
-- 状态进入时设置，绘制时减去
self.entity.offsetY = 5
self.entity.offsetX = 0

love.graphics.draw(gTextures[anim.texture],
    gFrames[anim.texture][anim:getCurrentFrame()],
    math.floor(self.entity.x - self.entity.offsetX),
    math.floor(self.entity.y - self.entity.offsetY))
```

偏移只影响画面。`x`、`y` 始终是碰撞盒左上角，改偏移不会挪动判定，这正是它好用的原因：大图集留白再多也不必改碰撞盒。

| 状态           | `offsetX` | `offsetY` |
| -------------- | --------- | --------- |
| `idle`、`walk` | 0         | 5         |
| `swing-sword`  | 8         | 5         |

玩家碰撞盒是 16×22，比 32 像素高的格子矮一截。`offsetY = 5` 把贴图整体上移 5 像素，脚底就从碰撞盒下方 10 像素收到 5 像素，视觉上不再像飘着。

## 方向与状态

`direction` 是一个字符串字段，四个取值直接拼进动画键名：`'walk-' .. direction`、`'sword-' .. direction`。加一种朝向只需加一组动画数据，代码不用动。

| 状态          | 进入条件   | 退出条件       |
| ------------- | ---------- | -------------- |
| `idle`        | 没有方向键 | 按方向键或空格 |
| `walk`        | 按住方向键 | 松手回 `idle`  |
| `swing-sword` | 空格       | 动画播完一圈   |

`PlayerWalkState:update` 用 `elseif` 依次判断左右上下，同时按两个键时只有一个方向生效，书写顺序就是优先级。想让左右压过上下，把左、右两支放前面即可。方向也决定按键的检测方式：`isDown` 每帧检查，`wasPressed` 每帧只认一次，所以挥剑用后者、走路用前者。

状态类也按这个思路分成两层：`PlayerWalkState` 继承 `EntityWalkState`，只覆盖 `update` 的前半段。

- 子类决定方向、切动画、处理空格与门
- 父类按方向算位移、做边界钳制、设置 `bumped`
- 敌人复用同一个父类，只是方向由 AI 给而非键盘

收益是物理只有一份。改走路速度或边界公式，玩家和所有怪物一起生效。

## 移动与边界

俯视房间的墙是固定图块，位置恒定，于是不必逐格做图块碰撞，直接钳制坐标。

```lua
self.entity.x = self.entity.x - self.entity.walkSpeed * dt
if self.entity.x <= MAP_RENDER_OFFSET_X + TILE_SIZE then
    self.entity.x = MAP_RENDER_OFFSET_X + TILE_SIZE
    self.bumped = true
end
```

- 左边界是 `MAP_RENDER_OFFSET_X + TILE_SIZE`，墙占一格
- 右边界是 `VIRTUAL_WIDTH - TILE_SIZE * 2`，还要减实体宽度
- 上边界减 `height / 2`，让人物贴墙时脚仍留在墙内
- `bumped` 每帧先清零，撞到才置真，撞门逻辑复用它

速度乘 `dt`，`PLAYER_WALK_SPEED = 60` 表示每秒 60 像素，约 3.75 格。

## 图集里的编号

角色图集是四行，每行四帧，按左到右、上到下的顺序线性编号。四个方向的走路动画正好占满十六帧。

| 动作 | `down` | `up` | `left` | `right` |
| ---- | ------ | ---- | ------ | ------- |
| 走路 | 1–4    | 9–12 | 13–16  | 5–8     |
| 站立 | 1      | 9    | 13     | 5       |
| 挥剑 | 1–4    | 5–8  | 13–16  | 9–12    |

挥剑用的是另一张 32×32 的图集，所以切图时要分开调用：`GenerateQuads(tex, 16, 32)` 和 `GenerateQuads(tex, 32, 32)`。同一张图用错尺寸，格子会错位半格，画出来全是残肢。

左右两套帧在贴图里是分别画的，不是水平翻转。讲义特意保留原图，因为剑与盾的遮挡关系翻转后会反。

## 延伸：放开斜向移动

课程用 `elseif` 牺牲了斜向，只走单轴。若两个轴同时加位移，速度会变成 $\sqrt{2}$ 倍，斜着跑比直着快约 41%，手感明显不对。

```lua
local dx, dy = 0, 0
if love.keyboard.isDown('left') then dx = dx - 1 end
if love.keyboard.isDown('right') then dx = dx + 1 end
if love.keyboard.isDown('up') then dy = dy - 1 end
if love.keyboard.isDown('down') then dy = dy + 1 end
if dx ~= 0 or dy ~= 0 then
    local len = math.sqrt(dx * dx + dy * dy)
    self.entity.x = self.entity.x + dx / len * speed * dt
    self.entity.y = self.entity.y + dy / len * speed * dt
end
```

归一化之后还要挑动画：图集里没有斜向帧，通常按最后按下的轴选一组，或按 `dx` 优先固定风格。两条斜线在视觉上都会有点滑步，这是 8 方向素材的固有限制。素材没补齐之前，先维持四向更稳，斜向留到美术资源齐了再说。

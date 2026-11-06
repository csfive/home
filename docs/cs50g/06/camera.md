---
title: 相机与坐标
description: 哈佛 CS50G Week 6 · 相机与坐标
---

# 相机与坐标

物理世界用一套坐标，屏幕用另一套。相机只是在 `render` 时给绘制加偏移，物理本身完全不动。

## 两套坐标

Box2D 的 body 坐标是世界坐标，单位像素，原点在关卡左上角。屏幕坐标是 640×360 的虚拟分辨率，再经 `push` 缩放到窗口。

| 操作                      | 影响       |
| ------------------------- | ---------- |
| `love.graphics.translate` | 只影响绘制 |
| `body:setPosition`        | 只影响物理 |
| `love.mouse.getPosition`  | 窗口输入   |

相机偏移永远不要加到 body 上。把 `camX` 加进 `body:setPosition`，物理世界会真的移动，碰撞、重力、关卡边界全部跟着错位。

## 平移绘制

`love.graphics.translate` 改变后续所有绘制的原点，直到下一次重置。LÖVE 每帧开始会把变换恢复成单位矩阵，所以只需在 `love.draw` 里设置一次。

```lua
function PlayState:render()
    self.level.background:render()

    love.graphics.translate(math.floor(self.levelTranslateX), 0)
    self.level:render()
end
```

`math.floor` 把偏移取整。摄像机停在半个像素上时，贴图采样会抖动或发虚，像素风尤其明显。

- UI 画在平移之前，或用 `love.graphics.push()` / `pop()` 包住关卡绘制
- 变换是叠加的，两次 `translate` 的偏移会累加
- 前景层与背景层共用同一个偏移，分别设值会错位

## 滚动与视差

课程用左右方向键移动相机，速度是 `MAP_SCROLL_X_SPEED`，并把手动平移限制在正负一个屏幕宽度。

```lua
if love.keyboard.isDown('left') then
    self.levelTranslateX = math.min(
        self.levelTranslateX + MAP_SCROLL_X_SPEED * dt,
        VIRTUAL_WIDTH
    )
elseif love.keyboard.isDown('right') then
    self.levelTranslateX = math.max(
        self.levelTranslateX - MAP_SCROLL_X_SPEED * dt,
        -VIRTUAL_WIDTH
    )
end
```

方向容易绕晕：按左键，绘制原点右移，整张关卡在屏幕上向右滑，露出左边的新区域；按右键则相反，屏幕向左滑，露出右边。

边界值不是猜的。地面 edge shape 覆盖 `-VIRTUAL_WIDTH` 到 `2 * VIRTUAL_WIDTH`，相机正好在这段范围内移动。

### 背景视差

背景不参与相机平移，它有自己的偏移，速度是地图的一半，形成远近层次。

```lua
self.xOffset = (self.xOffset + BACKGROUND_SCROLL_X_SPEED * dt) % self.width
```

取模让偏移永远落在一个贴图宽度内。绘制时画三份：`xOffset - width`、`xOffset`、`xOffset + width`，无论偏移多少都能铺满屏幕。

背景先于平移绘制，不受相机变换影响；滚动感来自贴图自身的横向移动，而不是相机变换。

## 鼠标换算

鼠标给的是窗口坐标，先 `push.toGame` 转成虚拟坐标，再减去相机偏移，才是世界坐标：

```lua
local gx, gy = push.toGame(love.mouse.getPosition())
local worldX = gx - self.levelTranslateX
```

拖拽发射、点击障碍、选择关卡都要做这一步。相机滚动后没换算，准星会偏移一个屏幕的距离。

反过来，如果要把世界坐标画成 UI 标记，就加上相机偏移。两个方向搞混，标记会朝相反方向跑。

## 跟随与缩放

让相机跟随角色时，直接赋值会硬切，用插值更顺：

```lua
self.camX = self.camX + (targetX - self.camX) * math.min(1, 8 * dt)
```

乘 `dt` 让逼近速度与帧率无关，`math.min` 防止系数超过 1 造成过冲。目标越远移动越快，接近时自然减速。

- 缩放用 `love.graphics.scale(s, s)`，通常放在 `translate` 之后；鼠标坐标要除以 `s`
- hump 的 `camera` 用 `attach` / `detach` 包住绘制，仍然只影响绘制

## 常见坑

- 在 `update` 里调用 `translate`，什么都没发生
- 平移后没恢复，UI 跟着关卡滚动
- 把相机偏移加到 body 坐标，物理世界被移动两次
- 偏移不取整，像素画面抖动
- 边界没钳制，相机滚出地面
- 背景和地图同速，失去纵深
- 鼠标坐标忘了减相机，点击错位

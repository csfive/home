---
title: 拖拽与发射
description: 哈佛 CS50G Week 6 · 拖拽与发射
---

# 拖拽与发射

拖拽发射的重点不是物理，而是把一次鼠标拖动翻译成速度：拖动越远，松手时给鸟的初速度越大，方向相反。

## 鼠标输入

LÖVE 提供两种粒度的接口：回调和持续状态。

| 接口                       | 触发时机 | 用途         |
| -------------------------- | -------- | ------------ |
| `love.mousepressed`        | 按下瞬间 | 开始瞄准     |
| `love.mousereleased`       | 松开瞬间 | 发射         |
| `love.mouse.isDown(1)`     | 按住期间 | 查询持续状态 |
| `love.mouse.getPosition()` | 任意时刻 | 读取拖动坐标 |

`wasPressed` 不是 LÖVE 的内建函数。课程在 `main.lua` 里自己搭了一层：事件回调把按键记进表，每帧末清空。

```lua
function love.load()
    love.mouse.keysPressed = {}
    love.mouse.keysReleased = {}
end

function love.mousepressed(x, y, button)
    love.mouse.keysPressed[button] = true
end

function love.mousereleased(x, y, button)
    love.mouse.keysReleased[button] = true
end

function love.mouse.wasPressed(button)
    return love.mouse.keysPressed[button]
end

function love.mouse.wasReleased(button)
    return love.mouse.keysReleased[button]
end

function love.update(dt)
    -- 这一帧的所有逻辑
    love.mouse.keysPressed = {}
    love.mouse.keysReleased = {}
end
```

表必须在每帧处理完输入后清空，否则一次点击会在之后每一帧都算“刚按下”。`button` 是数字，左键为 `1`。

## 坐标换算

窗口可以被 `push` 缩放，鼠标坐标是窗口坐标，必须转回 640×360 的虚拟坐标：

```lua
local x, y = push.toGame(love.mouse.getPosition())
```

如果关卡已经平移，还要减去相机偏移：`worldX = gameX - levelTranslateX`。漏掉这一步，画面滚到右边后准星会整体偏移。

物理 body 的坐标始终是世界坐标，与相机无关。相机只改绘制，不改模拟。

## 拖动状态

弹弓有两个位置：锚点 `baseX/baseY` 和当前拖动点 `shiftedX/shiftedY`。拖动点被限制在锚点周围 30 像素内。

```lua
if love.mouse.wasPressed(1) and not self.launched then
    self.aiming = true
elseif love.mouse.wasReleased(1) and self.aiming then
    self:launch()
elseif self.aiming then
    self.shiftedX = math.min(self.baseX + 30, math.max(x, self.baseX - 30))
    self.shiftedY = math.min(self.baseY + 30, math.max(y, self.baseY - 30))
end
```

松手之前不创建 body，画面上那只鸟只是贴图。这样拖动时不会与地面或其他刚体碰撞，也省掉一个待销毁对象。

两个布尔量分工：`aiming` 表示正在拉弓，`launched` 表示这一发已经出去。松开时还要再检查 `aiming`，否则在任意位置点一下也会发射。

## 发射速度

```lua
self.alien = Alien(self.world, 'round', self.shiftedX, self.shiftedY, 'Player')

self.alien.body:setLinearVelocity(
    (self.baseX - self.shiftedX) * 10,
    (self.baseY - self.shiftedY) * 10
)

self.alien.fixture:setRestitution(0.4)
self.alien.body:setAngularDamping(1)
```

差值取“锚点减拖动点”，方向与拖动相反：往左下拖，鸟飞向右上。乘 10 是灵敏度系数，拖动上限 30 像素，所以每个轴最多 300 像素/秒。

| 常量     | 课程取值        | 作用         |
| -------- | --------------- | ------------ |
| 锚点     | `(90, H - 100)` | 弹弓位置     |
| 拖动上限 | 30 像素         | 限制拉弓距离 |
| 速度系数 | 10              | 像素差转速度 |
| 弹性     | 0.4             | 撞地反弹     |
| 角阻尼   | 1               | 旋转快速衰减 |

`setLinearVelocity` 直接赋值，不受质量影响。想要“拉得越满越重”的手感，应改用 `applyLinearImpulse`，冲量除以质量才会产生不同效果。

手感由三个量共同决定：拖动上限、速度系数、角阻尼。上限翻倍时系数应减半，保持 300 像素/秒的天花板；只改一个，鸟要么飞不出屏幕，要么直接越过整张地图。

## 轨迹预览

轨迹就是把当前速度代进运动学公式，逐帧算出未来位置。课程跑 90 步，每 5 步画一个点，共 18 个点。

```lua
local vx = (self.baseX - self.shiftedX) * 10
local vy = (self.baseY - self.shiftedY) * 10
local _, gravityY = self.world:getGravity()
local dt = 1 / 60

for i = 1, 90 do
    local t = i * dt
    local x = self.shiftedX + t * vx
    local y = self.shiftedY + t * vy + 0.5 * (t * t + t * dt) * gravityY

    if i % 5 == 0 then
        love.graphics.circle('fill', x, y, 3)
    end
end
```

X 轴是匀速，Y 轴多一项重力。`0.5 * (t * t + t * dt)` 里的 `t * dt` 是离散积分的半步修正：每一步先更新速度再更新位置，累加起来会比连续公式多半个步长。

预测只考虑重力和初速度，不包含碰撞与阻尼。鸟撞到东西后，虚线和实际路径就会分叉。

## 常见坑

- 忘记每帧清空按键表，一次点击发射一串鸟
- 只在 `mousemoved` 里更新拖动点，按下瞬间会漏掉坐标
- 松开时不判断 `aiming`，随便点一下也发射
- 拖动不设上限，速度可以无限大
- 相机平移后没换算鼠标坐标
- 发射后不重置发射器，下一只鸟无法拖动
- 用 `setPosition` 移动鸟，穿透所有障碍

---
title: 精灵
description: 哈佛 CS50G Week 1 · 图像与精灵
---

# 精灵

Pong 只画矩形，Flappy Bird 要画图：把 `love.graphics.rectangle` 换成一个 `Image` 对象，就已经完成一半。精灵和图片在代码里是同一个 `Image`，差别只在用法：会移动、被反复绘制的那张叫精灵，铺满整屏的叫背景。

## 加载与绘制

`love.graphics.newImage(path)` 把图片文件读成 GPU 纹理，`love.graphics.draw(image, x, y)` 把它贴到屏幕的 `(x, y)`，锚点是左上角。加载失败会直接抛错，不会静默返回 `nil`；文件名大小写敏感，Linux 上尤其明显。

像素图必须先去掉线性过滤，否则放大后边缘发糊。设置顺序很关键：`setDefaultFilter` 只影响之后新建的图片和字体，已创建的纹理不会追溯修改。

```lua
function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')
    local bird = love.graphics.newImage('bird.png')
    love.graphics.draw(bird, 100, 80)
end
```

| 调用                                   | 返回 / 作用              |
| -------------------------------------- | ------------------------ |
| `love.graphics.newImage(path)`         | `Image` 对象，纹理进显存 |
| `image:getWidth()`                     | 像素宽                   |
| `image:getDimensions()`                | 宽、高两个返回值         |
| `love.graphics.draw(img, x, y)`        | 左上角对齐绘制           |
| `img:setFilter('nearest', 'nearest')`  | 只改这一张图的过滤       |
| `love.graphics.setDefaultFilter(a, b)` | 之后新建资源的默认过滤   |
| `image:type()`                         | 返回字符串 `'Image'`     |

`draw` 的完整签名是 `draw(image, x, y, r, sx, sy, ox, oy, kx, ky)`：位置之后依次是弧度旋转、XY 缩放、原点偏移和切变。原点默认在图片左上角，想绕中心旋转，得自己传 `ox = width / 2, oy = height / 2`。

路径由 LÖVE 的虚拟文件系统解析，根目录就是游戏目录：`assets/bird.png` 在开发时和打包成 `.love` 后都能跑，绝对路径则在别人机器上失效。`love.graphics.getStats()` 里的 `texturecount` 与 `texturememory` 能看出纹理是否在涨，后者单位是字节。

## 用 Class 封装

课程用 hump 的 `Class`：`Bird = Class{}` 之后，`Bird()` 会新建表并调用 `Bird:init()`。图片、尺寸、坐标都挂在 `self` 上，`main.lua` 只负责调用 `bird:update(dt)` 和 `bird:render()`。

```lua
Bird = Class{}

function Bird:init()
    self.image = love.graphics.newImage('bird.png')
    self.width = self.image:getWidth()
    self.height = self.image:getHeight()
    self.x = VIRTUAL_WIDTH / 2 - self.width / 2
    self.y = VIRTUAL_HEIGHT / 2 - self.height / 2
end

function Bird:render()
    love.graphics.draw(self.image, self.x, self.y)
end
```

冒号是语法糖：`bird:update(dt)` 等价于 `Bird.update(bird, dt)`。定义时写成 `function Bird.update(dt)` 却用冒号调用，`self` 就顶掉了 `dt`，症状是 `attempt to index a nil value` 或 `dt` 变成 table。反过来定义用冒号、调用用点号，`self` 传成 `nil`，第一次访问字段就崩。

## 尺寸来自图片

`self.width = self.image:getWidth()` 看着啰嗦，但它让换图不用改代码。写死宽高，换素材就错位；从图片读尺寸，居中公式永远成立。管道也一样，把 `PIPE_WIDTH`、`PIPE_HEIGHT` 提成共享常量，碰撞和生成才有同一套依据。

```lua
-- 居中：先减一半，不是直接除以二
self.x = VIRTUAL_WIDTH / 2 - self.width / 2
```

虚拟分辨率下算出来的坐标，再由 push 放大到窗口。所有游戏逻辑都用虚拟坐标，别拿 `love.graphics.getWidth()` 去算位置，否则窗口一变布局就散。换皮肤时只要替换图片文件，布局代码一行都不必动。

## 颜色、透明与染色

`love.graphics.setColor(r, g, b, a)` 设置的是「之后所有绘制」的乘算颜色，取值 0 到 1。它不会自动复位：画完带颜色的东西忘了写 `setColor(1, 1, 1, 1)`，接下来整屏素材都会发红发暗，症状像贴图坏了。

```lua
love.graphics.setColor(1, 1, 1, 0.5)   -- 半透明
love.graphics.draw(background, 0, 0)
love.graphics.setColor(1, 1, 1, 1)     -- 必须复位
```

几种常见用法：黑色遮罩用 `setColor(0, 0, 0, 0.45)` 画全屏矩形，就是暂停蒙层；受击泛红用 `setColor(1, 0.4, 0.4)` 画一帧。颜色只影响绘制，不会改图片本身。

透明像素仍然会被 `draw` 画出来，所以视觉上的留白在碰撞里并不存在。这也是为什么碰撞盒要内缩，而不是指望透明区域自动放行。

## 延伸：纹理只加载一次

图片存在显存里，`newImage` 每次调用都会新建一份。若在 `Pipe:init()` 里加载同一张 `pipe.png`，每生成一对管就多占一份显存，几分钟后就纯属浪费。

```lua
local PIPE_IMAGE = love.graphics.newImage('pipe.png')

function Pipe:init(orientation, y)
    self.image = PIPE_IMAGE
end
```

`Class{}` 本身不会帮你复用资源，只有文件顶部的 `local` 会：它在该模块被 `require` 时执行一次。绘制顺序同样值得记住，`draw` 调用顺序就是图层次序，后画的盖住先画的，Flappy Bird 固定为背景、管道对、鸟、地面。

- 绘制坐标尽量取整：`nearest` 过滤下 `x = 100.37` 会让像素在相邻两列间跳，`math.floor` 一行就稳定
- 屏幕外的对象不必绘制：管道几十对时可忽略，上百个砖块时才值得先判 `x + width > 0`
- 图片放模块顶部，`require` 时执行一次
- 字体同理，`newFont` 别写进 `render`
- `getWidth()` 与 `getDimensions()` 都能取尺寸，单取宽高时前者顺手
- 同一个 `Image` 可以被多个对象引用，不会复制像素

下一讲的 sprite sheet 会用到 `newQuad`，从一张大图里裁出单帧，避免为每个动画帧存一个文件。

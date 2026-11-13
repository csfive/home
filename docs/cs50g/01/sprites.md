---
title: 精灵
description: 哈佛 CS50G Week 1 · 图像与精灵
---

# 精灵

精灵和图片在代码里是同一个 `Image`：会移动、被反复绘制的那张叫精灵，铺满整屏的叫背景。

## 加载与绘制

`love.graphics.newImage(path)` 把图片读进显存，`love.graphics.draw(image, x, y)` 贴到 `(x, y)`，锚点左上角。加载失败直接抛错，不会返回 `nil`；文件名大小写敏感，Linux 上尤其明显。

| 调用                                   | 作用                     |
| -------------------------------------- | ------------------------ |
| `love.graphics.newImage(path)`         | `Image` 对象，纹理进显存 |
| `image:getWidth()`                     | 像素宽                   |
| `image:getDimensions()`                | 宽、高两个返回值         |
| `love.graphics.draw(img, x, y)`        | 左上角对齐绘制           |
| `img:setFilter('nearest', 'nearest')`  | 只改这一张图             |
| `love.graphics.setDefaultFilter(a, b)` | 之后新建资源的默认过滤   |

像素图要先关掉线性过滤，否则放大后边缘发糊。`setDefaultFilter` 只影响之后新建的图片和字体，已创建的纹理不会追溯修改。

```lua
function love.load()
    love.graphics.setDefaultFilter('nearest', 'nearest')
    bird = love.graphics.newImage('bird.png')
    love.graphics.draw(bird, 100, 80)
end
```

`draw` 的完整签名是 `draw(image, x, y, r, sx, sy, ox, oy, kx, ky)`，位置之后依次是弧度旋转、缩放、原点偏移和切变。原点默认在左上角，绕中心旋转要自己传 `ox = width / 2, oy = height / 2`。

路径由 LÖVE 的虚拟文件系统解析，根目录就是游戏目录，`assets/bird.png` 开发和打包都能跑，绝对路径在别人机器上失效。

绘制顺序就是图层次序，后画的盖住先画的：Flappy Bird 固定为背景、管道对、鸟、地面。

## 用 Class 封装

`Bird = Class{}` 之后，`Bird()` 新建表并调用 `Bird:init()`。图片、坐标挂在 `self` 上，`main.lua` 只调 `bird:update(dt)` 和 `bird:render()`。

```lua [Bird.lua]
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

宽高从图片读，换素材不用改代码；写死数字，换图就错位。居中先减一半，不是直接除以二。

定义用冒号、调用用点号，`self` 传成 `nil`，第一次访问字段就崩；反过来定义用点号却用冒号调用，`self` 顶掉 `dt`，症状是 `dt` 变成 table。

## 颜色与染色

`setColor(r, g, b, a)` 设置的是之后所有绘制的乘算色，取值 0 到 1，不会自动复位。画完忘了写 `setColor(1, 1, 1, 1)`，接下来整屏素材都发暗，症状像贴图坏了。

```lua
love.graphics.setColor(1, 1, 1, 0.5) -- 半透明
love.graphics.draw(background, 0, 0)
love.graphics.setColor(1, 1, 1, 1)   -- 必须复位
```

黑色遮罩用 `setColor(0, 0, 0, 0.45)` 画全屏矩形，就是暂停蒙层；受击泛红用 `setColor(1, 0.4, 0.4)` 画一帧。

透明像素仍然会被 `draw` 画出来，所以视觉上的留白在碰撞里并不存在——碰撞盒要内缩，不能指望透明区域放行。

## 纹理只加载一次

`newImage` 每次调用都新建一份显存纹理。写在 `Pipe:init()` 里，每生成一对管就多占一份。

```lua
local PIPE_IMAGE = love.graphics.newImage('pipe.png')

function Pipe:init(orientation, y)
    self.image = PIPE_IMAGE
end
```

只有文件顶部的 `local` 会复用：它在该模块被 `require` 时执行一次。字体同理，`newFont` 别写进 `render`。

显存占没占两份，`love.graphics.getStats()` 里的 `texturecount`、`texturememory` 能自查：进出状态几轮之后这两个数还在涨，就是漏了。

坐标取整也值得做：`nearest` 下 `x = 100.37` 会让像素在相邻两列间跳，`math.floor` 一行就稳定。

---
title: 界面组件
description: 哈佛 CS50G Week 7 · 界面组件
---

# 界面组件

对话框、选项菜单、血条看着是三样东西，拆开都是矩形、文字和比值。

## Panel 与 Textbox

`Panel` 只做一件事：画一块带边框的底板。先画白色圆角矩形，再把同样形状缩小 2px、换成深灰画一遍，露出的两圈白边就是边框。

画完把颜色复位成白色很重要。LÖVE 的颜色是全局状态，`Panel` 留下深灰，后面画的所有文字都会变灰，而错误现象出现在离原因很远的地方。

```lua
function Panel:render()
    if not self.visible then return end

    love.graphics.setColor(1, 1, 1, 1)
    love.graphics.rectangle('fill', self.x, self.y, self.width, self.height, 3)

    love.graphics.setColor(56/255, 56/255, 56/255, 1)
    love.graphics.rectangle('fill', self.x + 2, self.y + 2,
        self.width - 4, self.height - 4, 3)

    love.graphics.setColor(1, 1, 1, 1)
end
```

`rectangle` 的第五个参数是圆角半径，传 3 就得到 3 像素倒角。内框宽高各减 4、位置各加 2，才能保证四周留白均匀；只减 2 会让右下角压到外框上。`toggle()` 只是把 `visible` 取反，`render` 第一行据此提前返回，不需要额外的删除逻辑。坐标与宽高给整数同样重要，半像素会让 2px 边框在某条边上变成 3px。

`Textbox` 在构造函数里 `self.panel = Panel(x, y, width, height)`，自己不画背景，只负责把文字排进面板内部。它保存 `padding = 8`、`lineHeight = font:getHeight()`、`linePadding = 2`，这三个值决定了内容区能塞几行。`linePadding` 是行与行之间额外的像素，设成 0 时行会紧贴在一起，长段落读起来很挤：

```lua
self.maxLines = math.floor((self.height - 2 * self.padding) /
    (self.lineHeight + self.linePadding))
```

| 组件          | 职责           | 关键字段                                 |
| ------------- | -------------- | ---------------------------------------- |
| `Panel`       | 画底板与边框   | `x`、`y`、`width`、`height`、`visible`   |
| `Textbox`     | 分页显示长文本 | `textChunks`、`chunkCounter`、`maxLines` |
| `Selection`   | 上下选中的列表 | `items`、`gapHeight`、`currentSelection` |
| `Menu`        | 面板加选项     | `panel`、`selection`                     |
| `ProgressBar` | 显示比值       | `value`、`max`、`color`                  |

## 换行与分页

`font:getWrap(text, width)` 返回两个表：第一个是每一行渲染后的宽度，第二个是按宽度切好的行数组。只关心分行时用 `_, chunks = font:getWrap(text, limitWidth)` 丢弃第一个。

拿到完整行表后，每屏取 `maxLines` 行，用 `chunkCounter` 记住下一屏的起点：

```lua
function Textbox:nextChunks()
    local startIdx = self.chunkCounter
    local endIdx = math.min(startIdx + self.maxLines - 1, #self.textChunks)

    local chunks = {}
    for i = startIdx, endIdx do
        table.insert(chunks, self.textChunks[i])
    end

    if endIdx == #self.textChunks then
        self.endOfText = true
    else
        self.chunkCounter = endIdx + 1
    end
    return chunks
end
```

`endOfText` 为真表示这是最后一屏，再按回车就该关框；否则只是翻页。这两个动作语义不同，混成一个布尔值会让最后一屏需要多按一次。关框时把 `closed` 置为真，外部通过 `isClosed()` 查询，弹窗状态就是靠它决定何时 `pop`。

翻页发生在 `keypressed` 而不是 `update` 里。`update` 里查 `isDown('return')` 会在一秒内翻过十几屏，因为按住期间每一帧都返回真。`#self.textChunks` 就是总行数，判断有没有下一页不用再数字符。

## Selection 与 Menu

`Selection` 把选项列表均分到容器高度里，`gapHeight = height / #items`，第 `i` 项的绘制纵坐标就是 `y + (i - 1) * gapHeight`。上下键改变 `currentSelection`，到顶回到底、到底回到顶，靠取模或两个分支都能写。

回车时它不关心业务，只调用回调：

```lua
items = {
    { text = 'Fight', onSelect = function() battle:fight() end },
    { text = 'Run',   onSelect = function() gStateStack:pop() end }
}
```

`Menu` 没有任何自有逻辑，`render` 里先画 `panel` 再画 `selection`。这种组合优于继承：想换成无边框样式，改 `Panel` 一处就够。

- 光标通常就是一行 `> `，箭头位置要跟着 `currentSelection` 走，别在构造时算一次
- 回调可以闭包捕获外层对象，但 `Selection` 不传参数，需要战斗对象就直接在 `items` 里引用

## ProgressBar

填充宽度是比值乘总宽：

```lua
local renderWidth = (self.value / self.max) * self.width
love.graphics.rectangle('fill', self.x, self.y, renderWidth, self.height, 3)
love.graphics.rectangle('line', self.x, self.y, self.width, self.height, 3)
```

`value > 0` 时才画填充，否则 `renderWidth` 为 0，LÖVE 仍会画出一条退化矩形。边框要按 `width` 画而不是 `renderWidth`，这样槽位始终可见。

血条从满血掉到 0 时如果瞬间跳变，玩家读不出「掉了多少」。用 `Timer.tween(0.5, {[bar] = {value = newHP}})` 让数值在一段时间内插值，视觉上才有伤害感。tween 期间 `value` 是小数，是安全的，因为它只参与渲染。

- `max` 为 0 时除零得到 `nan`，构造时加一句 `max = math.max(1, def.max)`
- 颜色按 `value / max` 在 `render` 里选，构造时算死会一直是满血的颜色
- 选项不可选时，在 `onSelect` 里直接返回，渲染时用灰色文字

## 绘制顺序与裁剪

五个组件全是「先底后内容」：面板在选项之前，槽位在填充之后。LÖVE 没有节点树，谁后调 `draw` 谁在上面，顺序写错就是内容被盖住。

文字溢出框外时，靠 `love.graphics.setScissor(x, y, w, h)` 硬裁：

```lua
love.graphics.setScissor(self.x, self.y, self.width, self.height)
self.panel:render()
-- 逐行绘制文字
love.graphics.setScissor()
```

`setScissor()` 不传参数是清除裁剪，不是恢复上一层。嵌套使用要自己保存旧矩形，不能指望它自动出栈。

- `getWrap` 按空格断行，中文没有空格，一整段会被当成一个「词」，需要手动插换行符
- 选项超过一屏时，`Selection` 要配合滚动：只渲染窗口内几项，光标移出就移动 `offset`

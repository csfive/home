---
title: 音效与音乐
description: 哈佛 CS50G Week 1 · 音源、循环与叠加
---

# 音效与音乐

声音不改变任何逻辑，却是「像不像一个游戏」的分水岭。LÖVE 把音频抽象成 `Source`，短音效、长音乐、循环背景全都用同一个接口。

## 加载与播放

`love.audio.newSource(path, type)` 读入音频，返回可以反复播放的 `Source`。课程把所有音效放进一张按事件名索引的表，播放时只写语义：

```lua
sounds = {
    ['jump'] = love.audio.newSource('jump.wav', 'static'),
    ['score'] = love.audio.newSource('score.wav', 'static'),
    ['explosion'] = love.audio.newSource('explosion.wav', 'static'),
    ['hurt'] = love.audio.newSource('hurt.wav', 'static'),
    ['music'] = love.audio.newSource('marios_way.mp3', 'static')
}

function Bird:update(dt)
    if love.keyboard.wasPressed('space') then
        sounds['jump']:play()
    end
end
```

字符串键让调用点自解释：`sounds['score']:play()` 比 `sounds[3]:play()` 好读，也不会因为调整表顺序而错位。

| 事件     | 音源                 | 触发点             |
| -------- | -------------------- | ------------------ |
| 拍翅膀   | `jump`               | 空格或左键按下     |
| 过管     | `score`              | `scored` 置位的帧  |
| 撞管     | `explosion` + `hurt` | 进入 `score` 状态  |
| 背景音乐 | `music`              | `love.load` 里开播 |

## static 与 stream

第二个参数决定解码策略，选错只影响资源占用。

| 类型       | 解码方式         | 适用                 | 代价                   |
| ---------- | ---------------- | -------------------- | ---------------------- |
| `'static'` | 一次性全解到内存 | 短音效、要低延迟重播 | 占 RAM                 |
| `'stream'` | 边播边解         | 长音乐、大文件       | 有额外 CPU，定位有延迟 |

课程把那段短 mp3 也按 `'static'` 加载，因为短曲子常驻内存反而省事。十分钟的 BGM 用 `'stream'`，否则几十 MB 全躺在内存里。判断标准是文件大小和是否需要频繁重叠播放，不是文件后缀。

LÖVE 原生支持 wav、mp3、ogg，以及部分 tracker 格式。跨平台发布时优先 wav 或 ogg，解码器依赖最少。

| 方法                      | 作用                     |
| ------------------------- | ------------------------ |
| `source:play()`           | 播放；已在播则从头重播   |
| `source:pause()`          | 暂停，保留位置           |
| `source:resume()`         | 从暂停处继续             |
| `source:stop()`           | 停止播放                 |
| `source:setLooping(b)`    | 播完是否自动重来         |
| `source:setVolume(v)`     | 单个音源音量，0 到 1     |
| `love.audio.setVolume(v)` | 全局总音量               |
| `source:clone()`          | 复制一个可独立播放的实例 |

## 循环音乐

背景音乐要无缝循环：`setLooping(true)` 之后 `play()`，播到结尾自动回到开头。

```lua
sounds['music']:setLooping(true)
sounds['music']:play()
```

无缝的前提是素材本身首尾相接，尾部的混响不能在开头突然断掉。剪辑时把循环点放在过门中间，听感上就听不出接缝。

暂停游戏时音乐也该停。在暂停开关里成对调用，别只在进入状态时处理：

```lua
if paused then
    sounds['music']:pause()
else
    sounds['music']:play()
end
```

`:pause()` 与 `:resume()` 成对使用才保留位置；对一个正在播放的源再调 `:play()` 会从头重播，这也是同一音源连续触发会互相打断的根源。

## 叠加与 clone

撞上管道时课程同时播 `explosion` 与 `hurt` 两个音效，靠叠音凑出更厚重的撞击声，比专门合成一个音效省事。

但同一个 `Source` 在播放中再次 `play()` 会打断上一次，快速连撞时第二声会把第一声掐掉。要允许重叠，就复制实例：

```lua
local function playSfx(name)
    local src = sounds[name]
    if src:isPlaying() then
        src = src:clone()
    end
    src:play()
end
```

更简单的方案是把数组里的音效都 clone 一份轮换使用，代价是内存翻倍。`static` 源 clone 之后共享底层音频数据，不会真的复制解码结果，通常可以接受。

## 触发点放在逻辑层

音效在逻辑层播，也就是 `die()`、加分、拍翅膀这几处，而不是 `render` 里。`render` 每帧都跑，放进去会变成持续噪音；放进 `die()` 则天然保证一次死亡只响一次。

```lua
function PlayState:die()
    sounds['explosion']:play()
    sounds['hurt']:play()
    gStateMachine:change('score', { score = self.score })
end
```

切状态前播完这两声，`change` 之后 `PlayState` 已经不存在，再想补播也没机会了。

## 延伸：素材与平台

没有音效师也能做出可用的声音：

- [BFXR](https://www.bfxr.net/) 在线生成 8-bit 风格音效，导出 wav
- [ChipTone](https://sfbgames.itch.io/chiptone) 同类工具，参数更细
- [freesound.org](https://freesound.org/) 找真实录音，注意授权协议
- 授权优先级：CC0 最省事，CC-BY 需要在游戏里署名
- 格式不确定就用 wav，无损但体积大；单个音效通常只有几十 KB

命名按事件而非按文件：`jump`、`score`、`hurt`、`explosion`。换素材只换文件，调用点不用动。

音量分层也值得调：音乐压到 0.4 左右，音效保持 1.0，两者才不会互相盖住。`setVolume` 接受线性幅度而非分贝，0.5 约等于 -6 dB，听感上并不就是「小一半」，平衡靠耳朵调。

- 网页版导出受浏览器自动播放策略限制，必须等用户第一次点击后才能出声
- 移动端来电或切后台会中断音频，回到前台要重新 `play()`
- 音频从调用到出声之间有调度延迟，别把音效当成节奏判定的依据

---
title: 音效与音乐
description: 哈佛 CS50G Week 1 · 音源、循环与叠加
---

# 音效与音乐

LÖVE 把音频抽象成 `Source`，短音效、长音乐、循环背景都用同一个接口。

## 加载与播放

`love.audio.newSource(path, type)` 读入音频，返回可反复播放的 `Source`。课程把所有音效放进一张按事件名索引的表：

```lua
gSounds = {
    ['jump'] = love.audio.newSource('jump.wav', 'static'),
    ['score'] = love.audio.newSource('score.wav', 'static'),
    ['explosion'] = love.audio.newSource('explosion.wav', 'static'),
    ['music'] = love.audio.newSource('marios_way.mp3', 'static')
}

gSounds['score']:play()
```

字符串键让调用点自解释，也不会因为调整表顺序而错位。`g` 前缀表示全局，和 `gStateMachine`、`gTextures` 是同一套约定。

## static 与 stream

第二个参数决定解码策略，选错只影响资源占用。

| 类型       | 解码方式         | 适用                 | 代价                   |
| ---------- | ---------------- | -------------------- | ---------------------- |
| `'static'` | 一次性全解到内存 | 短音效、要低延迟重播 | 占 RAM                 |
| `'stream'` | 边播边解         | 长音乐、大文件       | 有额外 CPU，定位有延迟 |

课程把那段短 mp3 也按 `'static'` 加载，短曲子常驻内存反而省事；十分钟的 BGM 用 `'stream'`，否则几十 MB 全躺在内存里。判断标准是文件大小和是否需要频繁重叠播放，不是文件后缀。

| 方法                      | 作用                   |
| ------------------------- | ---------------------- |
| `source:play()`           | 播放；已在播则从头重播 |
| `source:pause()`          | 暂停，保留位置         |
| `source:resume()`         | 从暂停处继续           |
| `source:setLooping(b)`    | 播完是否自动重来       |
| `source:setVolume(v)`     | 单个音源音量，0 到 1   |
| `love.audio.setVolume(v)` | 全局总音量             |
| `source:clone()`          | 复制可独立播放的实例   |

## 循环与叠加

`setLooping(true)` 之后 `play()`，播到结尾自动回到开头。无缝的前提是素材本身首尾相接，剪辑时把循环点放在过门中间。

```lua
gSounds['music']:setLooping(true)
gSounds['music']:play()
```

暂停游戏时音乐也该停，在暂停开关里成对调用 `:pause()` 与 `:resume()`——只有成对才保留位置，对正在播放的源再调 `:play()` 会从头重播。

撞管时同时播 `explosion` 与 `hurt`，靠叠音凑出更厚重的撞击声。但同一个 `Source` 在播放中再次 `play()` 会打断上一次，快速连撞时第二声会把第一声掐掉：

```lua
local function playSfx(name)
    local src = gSounds[name]
    if src:isPlaying() then
        src = src:clone()
    end
    src:play()
end
```

`static` 源 clone 之后共享底层音频数据，不会真的复制解码结果，通常可以接受。

## 触发点放在逻辑层

音效在逻辑层播——`die()`、加分、拍翅膀这几处——而不是 `render` 里。`render` 每帧都跑，放进去会变成持续噪音；放进 `die()` 则天然保证一次死亡只响一次。

```lua
function PlayState:die()
    gSounds['explosion']:play()
    gSounds['hurt']:play()
    gStateMachine:change('score', { score = self.score })
end
```

切状态前播完这两声，`change` 之后 `PlayState` 已经不存在，再想补播也没机会。

## 素材与音量

没有音效师也能做出可用的声音：[BFXR](https://www.bfxr.net/) 生成 8-bit 音效并导出 wav，[ChipTone](https://sfbgames.itch.io/chiptone) 参数更细，[freesound.org](https://freesound.org/) 找真实录音但要看授权。

音量分层值得调：音乐压到 0.4 左右、音效保持 1.0 才不会互相盖住。`setVolume` 接受线性幅度而非分贝，0.5 约等于 -6 dB，平衡靠耳朵。网页版导出受浏览器自动播放策略限制，必须等用户第一次点击后才能出声。

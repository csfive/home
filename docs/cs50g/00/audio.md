---
title: 音效
description: 哈佛 CS50G Week 0 · 音频与素材
---

# 音效

Pong 只有三种声音：球拍、墙壁、得分。短音效统一用 `static` 加载，放进表里按名字播放。

## 加载

```lua
function love.load()
    sounds = {
        ['paddle_hit'] = love.audio.newSource('sounds/paddle_hit.wav', 'static'),
        ['wall_hit'] = love.audio.newSource('sounds/wall_hit.wav', 'static'),
        ['score'] = love.audio.newSource('sounds/score.wav', 'static')
    }
end
```

| 类型     | 适用                   |
| -------- | ---------------------- |
| `static` | 短音效，整段解码进内存 |
| `stream` | 背景音乐，边读边播     |

## 播放

```lua
sounds['paddle_hit']:play()
```

- `:play()` 每次调用重新开始
- 同一个 source 同时播多次需要 `:clone()`
- `:stop()` 停止，`:setVolume()` 调节音量

## 语义

| 事件     | 音效         |
| -------- | ------------ |
| 球拍碰撞 | `paddle_hit` |
| 墙壁碰撞 | `wall_hit`   |
| 得分     | `score`      |

音效和事件一一对应，玩家不看分数也能感知发生了什么。

## 素材

| 工具                                          | 用途                 |
| --------------------------------------------- | -------------------- |
| [BFXR](https://www.bfxr.net/)                 | 生成复古音效         |
| [ChipTone](https://sfbgames.itch.io/chiptone) | 更现代的芯片音生成器 |

导出成 `.wav` 放到 `sounds/`，路径相对于项目根目录。

## 常见坑

- 路径写错，LÖVE 启动时报错找不到文件
- 背景音乐用 `static`，占内存且加载慢
- 每帧调用 `:play()`，声音会叠成噪音

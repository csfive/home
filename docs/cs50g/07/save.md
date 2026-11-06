---
title: 存档
description: 哈佛 CS50G Week 7 · 存档
---

# 存档

游戏进程一关就没了，存档要把「会变的东西」写成文件，下次再拼回对象。

## 存档目录

LÖVE 不允许随便写磁盘，所有持久化都落在系统给这个游戏分配的目录里。目录名由 `identity` 决定，在 `conf.lua` 里设：

```lua
function love.conf(t)
    t.identity = 'pokemon'
    t.version = '11.4'
end
```

| 平台    | 路径                                         |
| ------- | -------------------------------------------- |
| macOS   | `~/Library/Application Support/LOVE/pokemon` |
| Windows | `%APPDATA%\LOVE\pokemon`                     |
| Linux   | `~/.local/share/love/pokemon`                |

不设 `identity` 时目录名是 `love`，所有没设的游戏挤在一起，卸载时容易误删。改 `identity` 等于换了一个新目录，旧存档不会自动搬过去。

`love.filesystem` 只能看到这个目录，`../` 之类的路径会被拒绝。这是沙箱，不是限制。

## 读写接口

| 函数                                | 作用          | 返回值                             |
| ----------------------------------- | ------------- | ---------------------------------- |
| `love.filesystem.write(name, data)` | 写文件        | `true` 或 `false, 错误信息`        |
| `love.filesystem.read(name)`        | 读全文        | 内容, 长度；失败返回 `nil, 错误`   |
| `love.filesystem.getInfo(name)`     | 看文件在不在  | 表或 `nil`                         |
| `love.filesystem.remove(name)`      | 删文件        | `true` 或 `false, 错误`            |
| `love.filesystem.load(name)`        | 当 Lua 块加载 | 函数；文件缺失会报错，先 `getInfo` |

写入前如果带子目录，先 `love.filesystem.createDirectory('saves')`，否则 `write` 返回失败。失败不会抛异常，不检查返回值就会以为自己存上了。写入的是字符串字节，中文按 UTF-8 原样保存，读回来不需要转码。

## 存什么

只存会变的状态：地图坐标、队伍成员的种类与等级、当前血量、经验。存 `baseHP`、贴图名这些常量没有意义，它们在定义表里已经有了。

```lua
local function saveGame(player, level)
    local rows = {}
    for _, p in ipairs(player.party.pokemon) do
        rows[#rows + 1] = string.format(
            "{ id = '%s', level = %d, currentHP = %d, currentExp = %d }",
            p.id, p.level, p.currentHP, p.currentExp)
    end

    local data = string.format(
        "return { version = 1, mapX = %d, mapY = %d, party = { %s } }",
        level.mapX, level.mapY, table.concat(rows, ', '))

    return love.filesystem.write('save.lua', data)
end
```

生成的文件本身就是一段 Lua，`return` 一个表。实例上没有 `id` 字段时，在 `Pokemon:init` 里补一行 `self.id = def.id`——存档需要的是稳定标识，不是显示名。

读的时候直接执行：

```lua
local function loadGame()
    if not love.filesystem.getInfo('save.lua') then
        return nil
    end

    local chunk = love.filesystem.load('save.lua')
    local ok, data = pcall(chunk)
    if not ok or not data then return nil end

    for _, row in ipairs(data.party) do
        local def = POKEMON_DEFS[row.id]
        local mon = Pokemon(def, row.level)
        mon.currentHP = row.currentHP
        mon.currentExp = row.currentExp
    end

    return data
end
```

关键点：存的是**数据**，读回来必须重新 `Pokemon(def, level)`。直接反序列化出一个对象是不可能的，函数和元表都不会写进文件。

- `pcall` 不能省：坏档、版本不匹配、写到一半断电，都会在执行存档块时抛错
- 重建时先构造再覆盖 `currentHP`，反过来会被 `init` 结尾的 `currentHP = HP` 冲掉
- 没有 `pcall` 的读档会让游戏在启动时直接崩掉

## 存档时机

常见做法有三种：

- 手动菜单存档
- 切场景时自动存档
- 退出时存档

退出时存档最不可靠：正常关闭窗口会触发 `love.quit`，强制结束进程、断电、崩溃都不会。只靠这一处，玩家丢掉的是整局进度。

如果仍想在退出时补一次，就挂在 `love.quit` 里：

```lua
function love.quit()
    saveGame(player, level)
end
```

`love.quit` 返回 `true` 会取消退出，所以回调里不要返回真值，除非确实想阻止关闭。

频繁写盘也有代价：每帧写一次会让磁盘忙起来，机械硬盘上还可能造成卡顿。按事件写，不要按帧写。存档也可以有多份，三个槽位就是三个文件名，不需要数据库：

```lua
local function slotFile(slot)
    return string.format('save%d.lua', slot)
end

for i = 1, 3 do
    local info = love.filesystem.getInfo(slotFile(i))
    print(i, info and info.size or 'empty')
end
```

`getInfo` 返回的表里带 `size` 与 `modtime`，够画一个「存档位 2 · 12.3 KB」的列表。要列目录用 `love.filesystem.getDirectoryItems('')`，它会返回存档根目录下的所有文件名，自己按前缀过滤。

- 槽位编号写进文件名，删档就是 `love.filesystem.remove(slotFile(i))`
- 把槽位存在索引文件里，反而多一个会损坏的地方
- 读档失败时不要覆盖原文件，提示损坏并保留，玩家还有机会手工修

## 版本与迁移

`version = 1` 不是装饰。加了新字段之后，旧存档缺字段是常态，读档时按版本补默认值：

```lua
if (data.version or 0) < 2 then
    data.badges = {}
end
```

比版本号更省事的做法是给每个字段兜底：`data.mapX or 1`。字段一多就会到处是 `or`，版本号更好管。

拼 Lua 字面量时，数字用 `%d`、布尔直接写 `true`/`false`、字符串必须带引号。漏引号不会报错：`name = pikachu` 会被当成全局变量，读回来是 `nil`，角色名变成空白。字段名一旦写进存档就别改，非要改就在迁移里同时认旧名，否则玩家的进度会静默丢失。

## 安全与调试

`love.filesystem.load` 会执行文件里的任意 Lua 代码。存档只该由自己写、自己读；如果要做存档分享或云同步，就换成纯数据格式（JSON、自定义文本），用解析器读，不要执行。

调试时想清空进度，直接删目录比在代码里加开关快：

```bash
rm -rf ~/Library/Application\ Support/LOVE/pokemon
```

存档位置也可以打出来：`print(love.filesystem.getSaveDirectory())`。找不到存档文件时，这一行比猜路径有用得多。

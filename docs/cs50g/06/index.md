---
title: Angry Birds
description: 哈佛 CS50G Week 6 主题清单
---

# Angry Birds

[Week 6 · Angry Birds](https://cs50.harvard.edu/games/weeks/6/ '哈佛 CS50G Week 6：视频、讲义、源码和项目')

[课后练习答案](https://github.com/csfive/CS50G/tree/main/06-angry-birds '非官方，仅供参考')

## [物理世界](/cs50g/06/world)

- `love.physics.newWorld(0, 300)`
- 世界是唯一推进物理的容器
- 重力单位是像素每二次方秒
- 默认 30 像素 = 1 米
- `300` 由 `9.8 × 30` 近似而来
- 零重力做俯视或太空玩法
- `world:update(dt)` 驱动整个模拟
- 固定步长 `1/60` 加累加器
- 可变 `dt` 过大会穿墙
- `velocityIterations` 默认 8
- `positionIterations` 默认 3
- `body:setBullet(true)` 做连续检测
- `world:getGravity()` 供轨迹预览
- 每关建一个新世界
- 渲染与物理世界分离

## [刚体](/cs50g/06/bodies)

- `love.physics.newBody(world, x, y, type)`
- body 只存位置、角度与速度
- 原点在质心，不在左上角
- `static` 固定，不受重力
- `dynamic` 受重力与碰撞
- `kinematic` 主动移动，不受外力
- Pong 的球拍适合 `kinematic`
- `body:getPosition()` 返回两个值
- `body:getAngle()` 返回弧度
- `setLinearVelocity` 直接改速度
- `applyLinearImpulse` 施加瞬时冲量
- `setLinearDamping` 与 `setAngularDamping`
- `setFixedRotation(true)` 锁定旋转
- `getMass()` 由 fixture 密度决定
- `body:destroy()` 与 `isDestroyed()`
- 一个 body 可挂多个 fixture

## [Shape 与 Fixture](/cs50g/06/fixtures)

- body 没有形状，fixture 才有
- `love.physics.newFixture(body, shape)`
- `newRectangleShape(w, h)` 原点居中
- `newCircleShape(r)` 参数是半径
- `newEdgeShape(x1, y1, x2, y2)` 做地面
- `newPolygonShape(vertices)` 要求凸多边形
- 多边形顶点上限 8 个
- `setRestitution(0.4)` 控制弹性
- `setFriction(0.5)` 控制滑动
- `setDensity` 决定质量
- `setSensor(true)` 只触发回调
- `setUserData('Player')` 打类型标签
- `fixture:getBody()` 在回调里反查
- `body:getWorldPoints(shape:getPoints())`
- `love.graphics.polygon` 画碰撞盒
- 精灵用 body 位置与角度绘制
- 同一 shape 可挂多个 fixture

## [拖拽与发射](/cs50g/06/launching)

- `love.mousepressed` 与 `love.mousereleased`
- `love.mouse.isDown(1)` 检测按住
- 课程自建 `love.mouse.wasPressed(1)`
- 事件表在每帧末清空
- `push.toGame` 把窗口坐标转虚拟坐标
- `baseX` 与 `baseY` 是弹弓锚点
- `shiftedX` 与 `shiftedY` 是拖动位置
- 拖动范围钳制在 ±30 像素
- 松手之前不创建 body
- 初速度 = 锚点减拖动位置乘 10
- 拖动方向与飞行方向相反
- `setRestitution` 让鸟弹跳
- `setAngularDamping(1)` 抑制旋转
- `aiming` 与 `launched` 两个布尔量
- 轨迹预测 90 帧，每 5 帧画点
- 轨迹 Y 轴叠加重力项

## [碰撞回调](/cs50g/06/collisions)

- `world:setCallbacks(begin, end, pre, post)`
- 回调参数是 fixture 与 contact
- `beginContact` 刚开始接触
- `endContact` 接触结束
- `preSolve` 求解前，可禁用接触
- `postSolve` 拿到法向与切向冲量
- `fixture:getUserData()` 判断类型
- 两个 fixture 的顺序不固定
- 只用 `beginContact`，其余留空
- 回调内禁止增删 body
- 世界在回调期间被锁定
- 延迟销毁表在 `update` 后清空
- `isDestroyed()` 防止重复销毁
- 速度阈值决定是否破坏
- 数组用倒序 `table.remove`
- `contact:isTouching()` 查询状态

## [相机与坐标](/cs50g/06/camera)

- 物理坐标与屏幕坐标分离
- `love.graphics.translate` 只改绘制
- 平移量 `levelTranslateX`
- 相机范围钳制在 `±VIRTUAL_WIDTH`
- `math.floor` 避免画面发虚
- 每帧开始变换自动重置
- 背景单独绘制并做视差
- 背景速度是地图的一半
- `xOffset % width` 实现无限平铺
- 鼠标坐标要减去相机偏移
- `love.graphics.scale` 做缩放
- hump `camera` 提供 `attach` 与 `detach`
- 跟随用插值逼近目标
- 世界宽度决定相机边界

## [关卡与计分](/cs50g/06/levels)

- `Level` 持有 world 与实体表
- `aliens` 与 `obstacles` 两个列表
- 地面用 `newEdgeShape` 拉长
- 障碍按中心坐标摆放
- 玻璃 1 击、木头 2 击、金属 3 击
- 命中次数存在实体字段
- 每次命中换裂纹贴图
- 血量归零才进销毁队列
- 清空敌人即胜利
- 障碍砸中敌人也算消灭
- 剩余鸟数可作失败条件
- 鸟停下或飞出左边界后重置
- 状态机只有 `start` 与 `play`
- 重开关卡要重建 world
- 分数来自摧毁物与剩余鸟
- 累加器放在 `Level:update`
- 关卡数据写成表便于扩展

## [关节](/cs50g/06/joints)

- joint 连接两个同世界的 body
- 锚点使用世界坐标
- `collideConnected` 决定两端是否碰撞
- `newWeldJoint` 刚性连接
- `newRevoluteJoint` 铰链旋转
- `newRopeJoint` 限制最大距离
- `newDistanceJoint` 固定距离
- `newPulleyJoint` 滑轮联动
- `newPrismaticJoint` 单轴滑动
- `newMouseJoint` 把 body 拖向鼠标
- `joint:destroy()` 解除约束
- 铰链可配马达与限位
- 关节把力传给两端
- 可搭吊桥、摆锤与杠杆

## [容易混淆的问题](/cs50g/06/pitfalls)

- `wasPressed` 是内建还是自己写的
- 重力该传 `9.8` 还是 `300`
- body 原点是左上角还是中心
- `beginContact` 里能不能 `destroy`
- `static` 与 `kinematic` 差在哪
- 相机偏移要不要加到 body 上
- 速度阈值 20 的单位是什么
- fixture 与 body 谁持有形状
- 拖得越远是否一定飞得越远
- `world:update` 与 `love.update` 的关系

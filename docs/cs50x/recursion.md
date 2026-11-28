# 怎么理解递归

递归就是函数在内部调用自己，理解每次调用都在栈上保留独立的变量和暂停位置，就能看懂从简单打印到分支搜索的执行过程。

```svg-diagram
<svg viewBox="0 0 680 250" role="img" aria-label="draw(3) 调用栈卡片压入与弹出过程示意图" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-rec-push" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--info)" />
    </marker>
    <marker id="cs50-rec-pop" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--success)" />
    </marker>
  </defs>

  <text x="176" y="30" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--foreground)">1. 逐层调用：每次新开一张栈帧</text>
  <text x="504" y="30" text-anchor="middle" font-size="12.5" font-weight="600" fill="var(--foreground)">2. 逐层返回：从栈顶依次接着跑</text>

  <rect x="44" y="48" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--warning)" stroke-width="1.4" />
  <text x="62" y="72" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--warning)">draw(0)</text>
  <text x="290" y="72" text-anchor="end" font-size="10.5" fill="var(--muted-foreground)">n = 0，直接 return</text>

  <rect x="44" y="96" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--info)" stroke-width="1.2" />
  <text x="62" y="120" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">draw(1)</text>
  <text x="290" y="120" text-anchor="end" font-size="10.5" fill="var(--muted-foreground)">n = 1，停在 draw(0)</text>

  <rect x="44" y="144" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--info)" stroke-width="1.2" />
  <text x="62" y="168" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">draw(2)</text>
  <text x="290" y="168" text-anchor="end" font-size="10.5" fill="var(--muted-foreground)">n = 2，停在 draw(1)</text>

  <rect x="44" y="192" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--info)" stroke-width="1.2" />
  <text x="62" y="216" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--foreground)">draw(3)</text>
  <text x="290" y="216" text-anchor="end" font-size="10.5" fill="var(--muted-foreground)">n = 3，停在 draw(2)</text>

  <line x1="24" y1="224" x2="24" y2="54" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-rec-push)" />

  <line x1="316" y1="67" x2="362" y2="67" stroke="var(--success)" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#cs50-rec-pop)" />
  <text x="339" y="59" text-anchor="middle" font-size="10" fill="var(--success)">结束</text>

  <rect x="372" y="48" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" stroke-dasharray="4 3" />
  <text x="504" y="72" text-anchor="middle" font-size="11" fill="var(--muted-foreground)">draw(0) 弹出，什么也不印</text>

  <rect x="372" y="96" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="390" y="120" font-size="11.5" font-family="var(--font-mono)" fill="var(--foreground)">回到 draw(1)</text>
  <text x="618" y="120" text-anchor="end" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">打印 #</text>

  <rect x="372" y="144" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="390" y="168" font-size="11.5" font-family="var(--font-mono)" fill="var(--foreground)">回到 draw(2)</text>
  <text x="618" y="168" text-anchor="end" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">打印 ##</text>

  <rect x="372" y="192" width="264" height="38" rx="8" fill="var(--sidebar)" stroke="var(--success)" stroke-width="1.2" />
  <text x="390" y="216" font-size="11.5" font-family="var(--font-mono)" fill="var(--foreground)">回到 draw(3)</text>
  <text x="618" y="216" text-anchor="end" font-size="11.5" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">打印 ###</text>

  <line x1="656" y1="54" x2="656" y2="224" stroke="var(--success)" stroke-width="1.6" marker-end="url(#cs50-rec-pop)" />
</svg>
```

## 调用栈

函数 `A` 调用函数 `B` 时，大家都很容易理解：`A` 停在调用 `B` 的那一行等结果，等 `B` 执行完 `return`，`A` 再从刚才暂停的下一行继续往下跑。

递归没有引入任何新机制，只是 `A` 调用的是带着不同参数的另一个自己。**每次调用都会在调用栈上新开一块独立空间**，就像桌上新叠一张便签纸：里面保存着这次调用自己的参数和暂停位置，所以外层的 `n = 3` 不会被内层的 `n = 2` 覆盖。

## 画金字塔

看 CS50x 第三周用递归画金字塔的例子：

```c
void draw(int n)
{
    if (n <= 0)
    {
        return;
    }

    draw(n - 1);

    for (int i = 0; i < n; i++)
    {
        printf("#");
    }
    printf("\n");
}
```

调用 `draw(3)` 时，执行顺序按时间线展开就是这 6 步：

| 步骤 | 当前函数              | 做了什么                                       |
| ---- | --------------------- | ---------------------------------------------- |
| 1    | `draw(3)`             | `n = 3`，还没打印，先调用 `draw(2)` 并暂停等待 |
| 2    | `draw(2)`             | `n = 2`，还没打印，先调用 `draw(1)` 并暂停等待 |
| 3    | `draw(1)`             | `n = 1`，还没打印，先调用 `draw(0)` 并暂停等待 |
| 4    | `draw(0)`             | `n = 0`，满足 `n <= 0`，直接 `return`          |
| 5    | `draw(1)`             | 恢复执行，用自己的 `n = 1` 印出 `#` 后返回     |
| 6    | `draw(2)` → `draw(3)` | 依次恢复执行，分别印出 `##` 和 `###` 后结束    |

如果把 `draw(n - 1);` 挪到 `for` 循环后面，每层会先用自己的 `n` 打印再暂停往下调，输出就会变成从 `###` 倒着印到 `#`。

## 返回值与出口

上面的 `draw` 没有返回值。如果函数需要把计算结果传回给外层，看一个求 $1 + 2 + \dots + n$ 的例子：

```c
int sum(int n)
{
    if (n <= 1)
    {
        return n;
    }

    return n + sum(n - 1);
}
```

调用 `sum(3)` 时，每一层都要等内层把数算出来，再做加法：

```text
sum(3)
= 3 + sum(2)
= 3 + (2 + sum(1))
= 3 + (2 + 1)
= 3 + 3
= 6
```

从 `draw` 和 `sum` 可以看出，一个能正常停下来的递归函数必须同时具备两件事：

- **终止条件（Base Case）**：最简单、不用再往下调用的出口，比如 `n <= 0` 或 `n <= 1`
- **缩小规模（Recursive Case）**：每次把参数朝终止条件推近一步，比如传 `n - 1`

漏写终止条件，或者参数没有缩小（例如误把 `n - 1` 写成 `n`），栈帧会一直往上叠直到内存耗尽，程序直接崩溃。

## Tideman 判环

画金字塔和求和用普通 `for` 循环其实更简单，它们只是用来看懂调用栈。真正需要递归的，是**不知道要深入几层、而且每层还有多条岔路**的问题，你没法提前写死嵌套几层 `for` 循环。

比如 `Tideman` 里判断从 `start` 出发，沿着已锁定的边 `locked` 能不能走到 `target`：

```c
bool has_path(int start, int target)
{
    if (start == target)
    {
        return true;
    }

    for (int i = 0; i < candidate_count; i++)
    {
        if (locked[start][i] && has_path(i, target))
        {
            return true;
        }
    }

    return false;
}
```

假设图里有三条已锁定的边：`A → D`（`D` 没有出边，是死胡同）、`A → B` 和 `B → C`。现在调用 `has_path(A, C)`：

- `A` 先找到边 `A → D`，调用 `has_path(D, C)`
- `D` 既不等于 `C` 也没有任何出边，循环结束后返回 `false`
- 回到 `A` 的 `for` 循环，刚才那条岔路没走通，继续试下一条边 `A → B`，调用 `has_path(B, C)`
- `B` 找到边 `B → C`，调用 `has_path(C, C)`，满足 `start == target` 返回 `true`
- `B` 收到 `true` 立刻向上返回 `true`，`A` 收到 `true` 也立刻返回 `true`，整次搜索结束

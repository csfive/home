# 溢出、截断和浮点误差

每个数字类型的字节宽度都是固定的，空间有限会直接带来整数溢出、除法截断和浮点误差三类坑。

```svg-diagram
<svg viewBox="0 0 680 222" role="img" aria-label="整数溢出回绕环、数轴除法截断与浮点刻度误差示意图" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="cs50-num-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--destructive)" />
    </marker>
    <marker id="cs50-num-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--info)" />
    </marker>
    <marker id="cs50-num-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M 0 0.6 L 5.5 3 L 0 5.4 z" fill="var(--success)" />
    </marker>
  </defs>

  <rect x="16" y="16" width="204" height="190" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="118" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">1. 整数溢出</text>
  <circle cx="118" cy="112" r="34" fill="none" stroke="var(--border)" stroke-width="2" />
  <line x1="118" y1="73" x2="118" y2="84" stroke="var(--muted-foreground)" stroke-width="1.2" />
  <path d="M 96 84 A 34 34 0 0 1 138 82" fill="none" stroke="var(--destructive)" stroke-width="2" marker-end="url(#cs50-num-red)" />
  <text x="118" y="66" text-anchor="middle" font-size="10.5" font-weight="600" font-family="var(--font-mono)" fill="var(--destructive)">+1 回绕</text>
  <text x="64" y="106" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--muted-foreground)">+21亿</text>
  <text x="172" y="106" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--destructive)">-21亿</text>
  <text x="118" y="160" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--muted-foreground)">0</text>
  <text x="118" y="188" text-anchor="middle" font-size="11" fill="var(--foreground)">大数改用 long (%li)</text>

  <rect x="238" y="16" width="204" height="190" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="340" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">2. 除法截断</text>
  <line x1="262" y1="118" x2="418" y2="118" stroke="var(--border)" stroke-width="2" />
  <line x1="274" y1="112" x2="274" y2="124" stroke="var(--muted-foreground)" stroke-width="1.4" />
  <line x1="318" y1="112" x2="318" y2="124" stroke="var(--info)" stroke-width="1.8" />
  <line x1="362" y1="112" x2="362" y2="124" stroke="var(--success)" stroke-width="1.8" />
  <line x1="406" y1="112" x2="406" y2="124" stroke="var(--muted-foreground)" stroke-width="1.4" />
  <text x="274" y="139" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">2</text>
  <text x="318" y="139" text-anchor="middle" font-size="10.5" font-weight="600" font-family="var(--font-mono)" fill="var(--info)">3</text>
  <text x="362" y="139" text-anchor="middle" font-size="10.5" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">4</text>
  <text x="406" y="139" text-anchor="middle" font-size="10.5" font-family="var(--font-mono)" fill="var(--muted-foreground)">5</text>
  <circle cx="340" cy="118" r="4" fill="var(--foreground)" />
  <text x="340" y="157" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--muted-foreground)">7 / 2 = 3.5</text>
  <path d="M 338 111 Q 328 88 319 109" fill="none" stroke="var(--info)" stroke-width="1.6" marker-end="url(#cs50-num-blue)" />
  <text x="304" y="84" text-anchor="middle" font-size="10" fill="var(--info)">截断</text>
  <path d="M 342 111 Q 352 88 361 109" fill="none" stroke="var(--success)" stroke-width="1.6" stroke-dasharray="3 2" marker-end="url(#cs50-num-green)" />
  <text x="376" y="84" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--success)">round</text>
  <text x="340" y="188" text-anchor="middle" font-size="11" fill="var(--foreground)">先转浮点，取整用 round</text>

  <rect x="460" y="16" width="204" height="190" rx="10" fill="var(--sidebar)" stroke="var(--border)" stroke-width="1.2" />
  <text x="562" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="var(--foreground)">3. 浮点误差</text>
  <line x1="482" y1="118" x2="642" y2="118" stroke="var(--border)" stroke-width="2" />
  <line x1="530" y1="118" x2="594" y2="118" stroke="var(--warning)" stroke-width="4" />
  <circle cx="530" cy="118" r="4.5" fill="var(--success)" />
  <circle cx="594" cy="118" r="4.5" fill="var(--warning)" />
  <text x="530" y="102" text-anchor="middle" font-size="10.5" font-weight="600" font-family="var(--font-mono)" fill="var(--success)">0.3</text>
  <text x="562" y="78" text-anchor="middle" font-size="10" fill="var(--warning)">二进制近似偏差</text>
  <line x1="530" y1="86" x2="594" y2="86" stroke="var(--warning)" stroke-width="1.2" stroke-dasharray="3 2" />
  <text x="594" y="142" text-anchor="middle" font-size="9.5" font-family="var(--font-mono)" fill="var(--warning)">0.3000...004</text>
  <text x="562" y="159" text-anchor="middle" font-size="10" font-family="var(--font-mono)" fill="var(--muted-foreground)">0.1 + 0.2 != 0.3</text>
  <text x="562" y="188" text-anchor="middle" font-size="11" fill="var(--foreground)">金额统一换算成整数</text>
</svg>
```

## 整数溢出（Integer Overflow）

C 里每种整数类型能表示的范围都是写死的：

| 类型   | 常见大小        | 范围                                                             | `printf` 占位符 |
| ------ | --------------- | ---------------------------------------------------------------- | --------------- |
| `int`  | 4 字节（32 位） | -2<sup>31</sup> 到 2<sup>31</sup> - 1（约 ±21 亿）               | `%i` / `%d`     |
| `long` | 8 字节（64 位） | -2<sup>63</sup> 到 2<sup>63</sup> - 1（约 ±9 × 10<sup>18</sup>） | `%li` / `%ld`   |

当数值超过上限继续往上加，就像汽车里程表满位归零一样，二进制最高位进位后会直接回绕成负数：

```c [overflow.c]
#include <stdio.h>

int main(void)
{
    int x = 2147483647; // 2^31 - 1
    x = x + 1;
    printf("%i\n", x);  // 未开 sanitizer 时输出 -2147483648（-2^31）
    return 0;
}
```

如果编译时开了 `-fsanitize=signed-integer-overflow`（本地 `Makefile` 默认已开），程序运行到 `x + 1` 时会直接报错并指出行号。

- 数值可能超过 21 亿时（例如 16 位银行卡号或时间戳），从输入到计算全程改用 `long`
- 打印 `long` 时占位符同步换成 `%li`，继续用 `%i` 会把高位截断

## 除法截断（Truncation）

在 C 语言里，**两个整数相除，结果仍然是整数**，小数部分会直接被丢掉，不会四舍五入：

```c [truncation.c]
#include <stdio.h>

int main(void)
{
    int a = 7;
    int b = 2;

    printf("%i\n", a / b);            // 3（小数 .5 被直接砍掉）
    printf("%f\n", (double) a / b);   // 3.500000（先转浮点，再做浮点除）
    printf("%f\n", (double) (a / b)); // 3.000000（先整数除成 3 再转，已经晚了）
    return 0;
}
```

有两个和截断相关的细节平时很容易漏掉：

- 表达式里只要先出现浮点数（如 `100.0 * letters / words` 或 `0.0588 * letters / words`），后面的整数会自动提升成浮点数参与运算，不需要再手写强转
- 把 `float` 或 `double` 直接赋给 `int`（或从返回值类型为 `int` 的函数里直接 `return`），同样会向零截断，想四舍五入要引入 `<math.h>` 调用 `round()`

```c [round_demo.c]
#include <math.h>
#include <stdio.h>

int main(void)
{
    double score = 4.8;
    int a = score;        // 4（直接截断）
    int b = round(score); // 5（四舍五入）

    printf("trunc = %i, round = %i\n", a, b);
    return 0;
}
```

## 浮点误差（Floating-Point Imprecision）

十进制里 `1 / 3` 写不成有限小数（`0.3333...`）。计算机底层用二进制存小数，同样有很多十进制看着很整的数（比如 `0.1` 和 `0.2`）在二进制里是无限循环小数，存进有限位数后只能保留近似值：

```c [imprecision.c]
#include <stdio.h>

int main(void)
{
    double sum = 0.1 + 0.2;
    printf("%.20f\n", sum);      // 0.30000000000000004441
    printf("%i\n", sum == 0.3);  // 0（不相等）
    return 0;
}
```

- `%.20f`：让 `printf` 打印小数点后 20 位，平时默认的 `%f` 只印 6 位，会把尾部的误差藏起来

平时写代码按这三条规避就够了：

- 涉及金额、找零或精确计数时，统一换算成最小整数单位（比如把美元换成美分用 `int` 算）
- 普通小数运算优先用 `double`（约 15 到 16 位有效数字），精度远高于 `float`（约 6 到 7 位）
- 需要比较两个浮点数是否相等时，检查差的绝对值是否小于一个极小阈值（如 `fabs(a - b) < 1e-6`），避免直接写 `==`

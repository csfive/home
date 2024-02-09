import random

# 生成随机数
secret_number = random.randint(1, 100)

print("欢迎参加猜数字游戏！")
print("我已经想好了一个 1 到 100 之间的整数，你需要猜出这个数字是多少。")

# 玩家猜测
guess = 0
while guess != secret_number:
    try:
        guess = int(input("请输入你的猜测："))
    except ValueError:
        print("请输入一个有效的整数！")
        continue

    # 判断猜测结果
    if guess < secret_number:
        print("太小了，再试一次！")
    elif guess > secret_number:
        print("太大了，再试一次！")
    else:
        print("恭喜你，猜对了！这个数字就是：", secret_number)

from functools import lru_cache

@lru_cache
def recur(most_recent_digit, rem_digits, drop, safe):
    # safe = sure that number is less than n
    if rem_digits == 0:
        return int(drop)

    total = 0

    for i in range(most_recent_digit, 10):
        if safe:
            total += recur(i, rem_digits - 1, drop, True)
        else:
            n_digit = (n // (10 ** (rem_digits - 1))) % 10
            if i < n_digit:
                total += recur(i, rem_digits - 1, drop, True)
            elif i == n_digit:
                total += recur(i, rem_digits - 1, drop, False)

    if not drop:
        for i in range(0, most_recent_digit):
            if safe:
                total += recur(i, rem_digits - 1, True, True)
            else:
                n_digit = (n // (10 ** (rem_digits - 1))) % 10
                if i < n_digit:
                    total += recur(i, rem_digits - 1, True, True)
                elif i == n_digit:
                    total += recur(i, rem_digits - 1, True, False)

    return total

total = 0
n_str = input()
n = int(n_str)
for digits in range(2, len(n_str) + 1):
    for first_digit in range(1, 10):
        if digits == len(n_str):
            n_digit = (n // (10 ** (digits - 1))) % 10
            if first_digit < n_digit:
                total += recur(first_digit, digits - 1, drop=False, safe=True)
            elif first_digit == n_digit:
                total += recur(first_digit, digits - 1, drop=False, safe=False)
        else:
            total += recur(first_digit, digits - 1, drop=False, safe=True)
print(total)
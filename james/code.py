import os
i = 1
for file in os.listdir("."):
    if file != "code.py":
        os.rename(file, f"{i}.{file.split(".")[-1]}")
        i+=1
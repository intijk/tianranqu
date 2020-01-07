---
date: 2020-01-3
tag: 
  - APUE
  - 读书笔记
author: 左趋趋
location: San Jose
---

# 你是哪个宝可梦？进程运行时的ID研究

![pokemon](./pokemon.jpeg)

Unix 系统里的ID在运行的过程中，有三种不同的ID。首先是Real user ID（ruid），这个id是在`/etc/passwd`里出现的.

```plain
cat /etc/passwd
...
phao:x:1000:1000:phao,,,:/home/phao:/bin/bash
...
```

这里可以看到我的用户id是1000，这就是real user id。

第二个id是effective id，这个id是运行时的判断，apue书里举了一个例子。修改密码这个操作，需要的是root权限，但是每个用户也应当允许修改自己的密码，用户会调用passwd程序，修改好密码之后要对`/etc/passwd`或`/etc/shadow`进行修改，但是这两个文件的属主都是 root 用户， id = 0. 普通用户，比如id=1000的你（ruid），允许运行passwd程序，但是一般情况下，你运行的程序会说，运行我的是1000用户，当它要写文件的时候，也是以1000用户的身份去写的。它去写文件，没有权限，这个操作就失败了。

显然，passwd就不能这样，它作为一个特殊程序，要代理你的操作，然后提权，才能把用户修改的新密码写入到系统文件里去。effective user id（euid），就是这个作用，进程操作资源的时候，检测的是euid，它可以不同于ruid。

运行 ls，发现passwd有一个特殊的权限位 s，这个叫做set user id bit。
```plain
phao@srazer:~$ l /usr/bin/passwd
-rwsr-xr-x 1 root root 59640 Mar 22  2019 /usr/bin/passwd*
```

这个s发生在了本来应该是x的地方（rwx），意思是当运行passwd程序的时候，进行set user id操作，这个操作就是把effective id设置为文件属主，我的用户id是1000（ruid）,但是这个文件的属主是0（root），那么我运行passwd，进程得到的euid是passwd文件的属主0，也即root用户，密码输入之后，euid为0的进程，去修改一个owner id为0的文件，是可以顺利操作的。

我们也写一个类似passwd的程序，然后print(geteuid())，看看euid是不是真的变成了0。

假设此程序叫做euid_test。
```cpp
#include <unistd.h>
#include <stdio.h>
int main()
{
    printf("ruid is : %d\n", getuid());
    printf("euid is : %d\n", geteuid());
    return 0;
}
```
把它的owner设置成root，然后设置set uid位，运行即可观察：
```plain
phao@srazer:~/p$ sudo chown root:root euid_test
phao@srazer:~/p$ sudo chmod +s euid_test
phao@srazer:~/p$ ls -l euid_test
-rwsr-sr-x 1 root root 8392 Jan  1 11:41 euid_test
phao@srazer:~/p$ ./euid_test
ruid is : 1000
euid is : 0
```

那么问题来了，binary如此，脚本程序也可以设置set uid big达到效果吗？答案是，不行，脚本程序不能通过设置set user id bit来进行euid的切换，是基于security的[原因](https://unix.stackexchange.com/questions/364/allow-setuid-on-shell-scripts?answertab=votes#tab-top)设计成这样的。。

我们用python脚本来尝试一下。
```python
phao@srazer:~$ cat euid_test.py
#!/usr/bin/python3
import os
print("ruid is :", os.getuid())
print("euid is :", os.geteuid())

phao@srazer:~$ ls -l euid_test.py
-rwsr-sr-x 1 root root 94 Dec 31 18:03 t.py

phao@srazer:~$ ./euid_test.py
uid: 1000
euid: 1000
```

如果我[把这个python脚本编译成一个binary](https://stackoverflow.com/questions/39913847/is-there-a-way-to-compile-python-application-into-static-binary)来运行呢？是的，和c编译出来的binary一样，可以成功切换euid。
```
phao@srazer:~$ ls -l test
-rwsr-sr-x 1 root root 25856 Dec 31 17:57 test
phao@srazer:~$ ./test
('uid:', 1000)
('euid:', 0)
```

但是如果你需要在ruid和切换到的euid之间左右横跳呢？你写了一个程序，有时候是用root做一些操作，有时候又想用自己的身份，创建一个文件。系统调用seteuid允许你设置自己当前的effective id。

比如上面的test程序，ruid=phao, 运行起来之后euid=root,然后我想以phao的身份创建一个文件，我可以在运行的过程中seteuid(1000), 来切换身份，文件操作结束之后，我继续用root的身份作威作福，可以seteuid(0).

ruid是root的话，seteuid可以用来切换成任何用户。但是作为普通用户，seteuid随意切换成任意人的身份，肯定是受限的。所以当进程运行起来的时候，其实有第三个id，叫做saved set-user-id，它的意思是，这个进程运行起来的时候，由于程序binary文件有s bit，进行了euid的切换，我先给他存个这个euid的备份，一会进程切换身份的时候，就和我这个备份比一比，它的euid只允许在ruid和我这个saved set-user-id之间切换，不能随意切换成任意人的身份。

当saved set-user-id是0的时候，即root的时候，ruid的普通用户其实也能切换成任意id了，因为你都有root的euid了，限制这个没有意义。

但是当saved set-user-id是普通用户的时候，就真的只能在你们两个屌丝之间切换了。
```cpp
phao@srazer:~/p$ cat euid_switch.c
#include <unistd.h>
#include <stdio.h>
int main()
{
	int uid=getuid();
	int euid=geteuid();
	printf("ruid is : %d\n", uid);
	printf("euid is : %d\n", euid);

	seteuid(uid);
	printf("Set euid to ruid.\n");
	printf("euid: %d\n", geteuid());

	seteuid(euid);
	printf("Set euid to saved set-user-id.\n");
	printf("euid: %d\n", geteuid());

	seteuid(1);
	printf("Set euid to a uid=1.\n");
	printf("euid: %d\n", geteuid());
	return 0;
}
```

```python
phao@srazer:~/p$ gcc euid_switch.c  -o euid_switch; sudo chown root:root euid_switch; sudo chmod +s euid_switch 
phao@srazer:~/p$ ./euid_switch 
ruid is : 1000
euid is : 0
Set euid to ruid.
euid: 1000
Set euid to saved set-user-id.
euid: 0
Set euid to a uid=1.
euid: 1    <--- 我ruid是1000, 因为有saved set-user-id=0罩着，我切成1也是可以的。
```

```python
phao@srazer:~/p$ gcc euid_switch.c  -o euid_switch; sudo chown solo:solo euid_switch; sudo chmod +s euid_switch 
phao@srazer:~/p$ ./euid_switch 
ruid is : 1000
euid is : 1001
Set euid to ruid.
euid: 1000
Set euid to saved set-user-id.
euid: 1001
Set euid to a uid=1.
euid: 1001   <--- 我ruid是1000, saved set-user-id=1001也是个屌丝，我切成1压根没用
```

太真实了，牛逼的朋友（root）借我一张身份卡，我可以切换成各种低级身份，而我上铺的兄弟，就只能和我自嗨。



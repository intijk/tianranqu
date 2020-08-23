---
title: Dota2 的护甲是多少？ 
date: 2020-01-27
tag: 
  - dota
author: 左趋趋
location: 掐拿
---

![护甲之力](./armor.png)

伤害倍数的计算公式是：

$$y=1-(\frac{(0.052 * x)}{(0.9+0.048*|x|)})$$ 
<font size=2> [(如何配置vuepress的公式)](
http://yaje.fun/tools/vuepress_website.html) </font>

其中 $y$ 是伤害倍数，$x$ 是护甲值。

根据这个公式。当攻击为135的单位攻击护甲为27的单位的时候，造成的物理伤害是多少呢？

带入 $x=27$, 得到 $y=0.361$，所以实际伤害是受到伤害的 0.361 倍，即 $135*0.361=48.735\approx49$

我做了一个简单的护甲计算器来计算伤害：

<ArmorCalculator/>

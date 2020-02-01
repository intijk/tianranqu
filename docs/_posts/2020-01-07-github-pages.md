---
date: 2020-01-7
tag: 
  - github pages
author: 左趋趋
location: San Jose
---

# 免费的便宜白不占，Github Pages设置

![拿来主义](./nalaizhuyi.jpg)

建立一个repo，叫做 username.github.io  

然后 username.github.io 这个网址就会指向 username.github.io 这个repo。

但是我不想让我的repo叫 username.github.io，想叫做wtfrepo怎么办？可以直接建立wtfrepo，然后通过配置，username.github.io/wtfrepo可以指向wtfrepo内部的内容。

我的站叫做tianranqu.com所以我搞了叫做tianranqu的repo。我的期望是用master branch写内容，然后gh-pages host page。

经测试，如果建立了 username.github.io repo， project就无法再配置project level custom domain, 所以第一步是删除掉username.github.io repo。

关于custom domain, [正经文档](https://help.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site)给了很多细节。[HTTPS](https://help.github.com/en/github/working-with-github-pages/securing-your-github-pages-site-with-https)现在也是一个网站的必备操作了。

然后进行以下几步操作我的期望即可达成

1. 在repo setting里设置github pages custom domain 为tianranqu.com
2. 设置tianranqu.com的A记录指向以下ip列表
3. 在gh-pages branch里把网站的静态内容加入并push。
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```



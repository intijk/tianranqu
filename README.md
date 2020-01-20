天然趣博客的配置

本地模式:
npx vuepress dev docs 

deploy到github
# 确认在master branch 上
git checkout master
# 编译静态文件
npx vuepress build docs
# 切换到gh-pages
git checkout gh-pages
# 添加内容
git add assets
git add 其它文件
# 发布内容
git push


// .vuepress/config.js
const d3=require('d3')
const d3node=require('d3-node')

module.exports = {
	title: '天然趣博客',
	description: '左趋趋的实验坊',
	//theme: '@vuepress/blog',	
	themeConfig: {
		nav: [
			{
				text: 'Blog',
				link: '/',
			},
			{
				text: 'Tags',
				link: '/tag/',
			},
			{
				text: 'About',
				link: '/about/',
			},
		]
	},
	markdown: {
		extendMarkdown: md => {
			md.set({
				html: true
			})
			md.use(require('markdown-it-katex'))
			md.use(require('markvis'), {d3node})
		}
	},
	head: [
		['link', {
			rel: 'stylesheet',
			href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.css'
		}],
		['link', {
			rel: "stylesheet",
			href: "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/2.10.0/github-markdown.min.css"
		}]
	]
}

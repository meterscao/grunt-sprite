## grunt-sprite

### 这是什么

这是一个帮助前端开发工程师将css代码中的切片合并成雪碧图的工具，它的主要功能是：

1. 使用二叉树排列算法，对css文件进行处理，收集切片序列，生成雪碧图
2. 在原css代码中为切片添加background-position属性
3. 生成用于高清设备的高清雪碧图，并在css文件末尾追加媒体查询代码
4. 在引用雪碧图的位置打上时间戳
5. 在样式末尾追加时间戳


### 安装依赖

`grunt-sprite` 使用 [spritesmith](https://github.com/Ensighten/spritesmith) 作为内部核心算法，根据官方文档中提到的[基本依赖](https://github.com/Ensighten/spritesmith#requirements)，须要安装[Graphics Magick(gm)](http://www.graphicsmagick.org/) 和 [PhantomJS](http://phantomjs.org/) 两个依赖。

* **Graphics Magick(gm)**

	`GraphicsMagick` 为 `grunt-sprite` 提供用于图像处理的框架，安装方法：
	
	* Mac
	
			// 安装GM图形库    
  			brew install GraphicsMagick 
  			
  	* Windows
  	
  		前往官方网站[下载安装GM图形库](http://www.graphicsmagick.org/download.html)
  		
* **PhantomJS**

	`PhantomJS` 为 `spritesmith` 提供 CSS选择器 与 JSON 的支持，安装方法：
		
	* Mac
	
			// 安装 Phantomjs
			brew install phantomjs
  			
  	* Windows
  	
  		前往官方网站[下载安装Phantomjs](http://phantomjs.org/download.html)
  		
  		
### 配置说明

  	// 自动雪碧图
      sprite: {
          allslice: {
              files: [
                  {
                      //启用动态扩展
                      expand: true,
                      // css文件源的文件夹
                      cwd: 'css',
                      // 匹配规则
                      src: ['*.css'],
                      //导出css和sprite的路径地址
                      dest: 'tmp/',
                      // 导出的css名
                      ext: '.sprite.css'
                  }
              ],
              options: {
	                        // 默认使用GM图像处理引擎
	                        'engine': 'gm',
	                        // 默认使用二叉树最优排列算法
	                        'algorithm': 'binary-tree',
	                        // 给雪碧图追加时间戳，默认不追加
	                        'imagestamp':false,
	                        // 给样式文件追加时间戳，默认不追加
	                        'cssstamp':true,
	                        // 是否以时间戳为文件名生成新的雪碧图文件，默认不生成新文件
	                        'newsprite':true

	                    }
          }
      }
      
      
* **files**

	使用标准的动态文件对象
	
	`dest` 指定一个输出的目录，将会在这个目录下创建一个`css/`和一个`sprite/`目录。
	
	
* **options**

	* `engine` 
	
		必选项，指定图像处理引擎，选择gm
	* `algorithm` 
	
		必选项，指定排列方式，有`top-down` （从上至下）, `left-right`（从左至右）, `diagonal`（从左上至右下）, `alt-diagonal` （从左下至右上）和 `binary-tree`（二叉树排列） 五种供选择。
	* `imagestamp`
	
		可选项，是否要给雪碧图追加时间戳，默认不追加
	* `cssstamp`
	
		可选项，是否给样式文件追加时间戳，默认不追加
	* 'newsprite'

		可选项，是否以时间戳为文件名生成新的雪碧图文件，默认不生成新文件
	
### 载入插件

请不要忘了载入插件

	grunt.loadNpmTasks('grunt-sprite');	
	
### 打个比方

有一个类似这样的目录结构：
		
		├── test				
			├── css/	
				└── icon.css		
			├── slice/	
					├── icon-a.png
					├── icon-a@2x.png		
					├── icon-b.png
					└── icon-b@2x.png
			└── publish
				├── css/
					└── icon.sprite.css
				└── sprite/	
					├── icon.png
					└── icon@2x.png
		
`css/icon.css` 调用`slice/`目录下的切片，`grunt-sprite` 会将 `css/icon.css` 进行处理。

在`publish/` 目录下生成 `css/` 和 `sprite/` 两个目录，`css/` 目录下是处理完成的样式 `icon.sprite.css` ，而 `sprite/` 目录下是合并完成的雪碧图 `icon.png`。

### 特别注意

1. css文件置于`css/`文件夹中，切片文件置于`slice/`文件夹中，且 `css/`和`slice/` 处于同级。
2. `css/` 和 `slice/` 目录不一定要处于项目根目录
3. 理论上所有的切片都应该是`.png`格式，`png8` `png24` 和 `png32`不限
4. 理论上高清切片都应该是源切片尺寸的2倍，所以所有高清切片的尺寸宽和高都必须是偶数
5. 生成后的雪碧图将以源css文件名来命名

### 版本记录

`0.0.2` 从 `grunt-hellosprite` 迁移

`0.0.3` 修改了命令行的打印提示用语

`0.0.4` 增加了“以当前时间为文件名生成新的雪碧图文件”选项，默认为否，并且将“给雪碧图追加时间戳”和“给样式文件追加时间戳”的默认选项改为否

`0.0.5` 修复了上一版在处理多文件任务时误删雪碧图的bug，感谢 [家乐](https://github.com/willerce)

### 致谢

感谢 [damao](https://github.com/damao) 把grunt带到我面前，让我如此惊喜，当然领导要写在前面。

感谢 [Todd Wolfson](https://github.com/twolfson) 耐心的解答，说多了都是泪，当然反正你也看不懂这段话。

感谢 [自力](https://github.com/hzlzh) 偏执地坚持MacOS和撕心裂肺地嚷着要在Macbook上自动雪碧图。

感谢 [CssGaga](http://www.99css.com/archives/542) 的作者 [ytzong](https://twitter.com/#!/ytzong) 带来的cssgaga模式。
















		

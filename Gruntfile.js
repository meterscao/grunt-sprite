/*
 * grunt-hellosprite
 * https://github.com/meterscao/test
 *
 * Copyright (c) 2013 meters
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

  // 自动雪碧图
      sprite: {
          allslice: {
              files: [
                  {
                      //启用动态扩展
                      expand: true,
                      // css文件源的文件夹
                      cwd: 'test/css',
                      // 匹配规则
                      src: ['*.css'],
                      //导出css和sprite的路径地址
                      dest: 'test/publish/',
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

  });

  // 载入任务
  grunt.loadTasks('tasks');

  // 声明一个别名
  grunt.registerTask('default', ['sprite']);

};

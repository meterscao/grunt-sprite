var spritesmith = require('spritesmith'),
    fs = require('fs'),
    path = require('path'),
    gm = require('gm');


module.exports = function (grunt) {

    "use strict";

    // Export the SpriteMaker function
    grunt.registerMultiTask('sprite', 'Create sprite image with slices and update the CSS file.', function () {

        var that = this,
            done = this.async(),
            log = console.log;

        var options = this.options({
            'imagestamp':false,
            'cssstamp':false,
            'newsprite':false
        });

        var hasDelete = false;


        var _spriteSmithWrapper = function (file, callback) {

            var src = file.src[0],
                destDir = file.orig.dest,
                dest = file.dest,
                timeNow = grunt.template.today("yyyymmddHHmmss"),
                regex = new RegExp('\\/?([^.\\/]*)\\..*', 'ig'),
                fileNameList = src.match(regex),
                fileName = fileNameList[0].replace(regex, '$1'),
                destCSS = destDir + "css/" + fileName + file.orig.ext,
                destSPRITE = destDir + "sprite/" + fileName + ".png";

            if (options.newsprite) {
                fileName = fileName + "-" + timeNow;
                destSPRITE = destDir + "sprite/" + fileName + ".png";
            }

            var cssSrc=path.dirname(src);
            var rootPath = path.dirname(cssSrc).toString();




            var sliceList = [],       //
                sliceCodeList = [],   //background-image:url("../slice/xxx.png")
                sliceImgUrlList = [], //slice/xxx.png
                sliceCode = [],       //
                data = [];            //

            // 获取slice部分的代码
            var getSliceList = function () {

                var regex = new RegExp('background-image:[\\s]*url\\(["\']?(?!http[s]?|/)[^;]*?(slice[\\w\\d\\s!./\\-\\_@]*\\.[\\w?#]+)["\']?\\)[^;}]*;?', 'ig'),
                    pathToResource;

                // 获取整个样式
                data = grunt.file.read(src);

                // 匹配到所有的background-image:url("../slice/xxx.png")
                sliceCodeList = data.match(regex);
                // 对background-image进行遍历，取出其中的slice/xxx.png
                if (sliceCodeList !== null) {
                    for (var x = 0; x < sliceCodeList.length; x++) {
                        // 匹配到css里图片的路径信息 slice/xxx.png
                        pathToResource = sliceCodeList[x].replace(regex, '$1');
                        sliceImgUrlList[x] =  pathToResource;
                        sliceList[pathToResource] = sliceCodeList[x];
                    }

                }
                else callback(false);
            };


            // 生成雪碧图
            var createSprite = function () {

                var config = that.data.options;

                var imglist =   sliceImgUrlList;




                if(rootPath !=".") for(var i =0 ; i< imglist.length ;i++)
                {
                    imglist[i] =   rootPath + '/' + imglist[i];
                }

                config.src = imglist;


                if (sliceImgUrlList.length > 0) {

                    // spritesmiteh 库调用
                    spritesmith(config, function (err, result) {
                        if (err) {
                            grunt.fatal(err);
                            return callback(err);
                        }
                        else {
                            // 生成sprite
                            grunt.file.write(destSPRITE, result.image, { encoding: 'binary' });
                            grunt.log.writelns(("Done! [Created] -> " + destSPRITE));
                            var tmpResult = result.coordinates;

                            for (var key in tmpResult) {
                                var newKey = key;
                                if(rootPath != ".") newKey = key.slice(rootPath.length + 1, key.length);

                                sliceCode[ newKey ] = tmpResult[ key ];
                                sliceCode[ newKey ].sprite = sliceList[ newKey ];
                            }

                            replaceCode();
                        }
                    });
                }
                else {
                    grunt.file.copy(src, destCSS);
                    grunt.log.writelns(("Done! [Copied] -> " + destCSS));
                }
            };

            //  替换css里的background-image代码部分
            var replaceCode = function () {

                var img;
                var datasprite = grunt.file.read(src);

                for (var key in sliceCode) {
                    img = sliceCode[ key ];
                    var code ='background-image: url("../sprite/' + fileName + '.png';
                    if(options.imagestamp) code+="?"+timeNow;
                    code+= '");';
                    code+=' background-position: -' + img.x + 'px -' + img.y + 'px;';
                    datasprite = datasprite.replace(img.sprite,code);
                }
                // 生成新的样式
                grunt.file.write(destCSS, datasprite);
                grunt.log.writelns(("Done! [Created] -> " + destCSS));
                retinaSprite();
            };


            // 生成retina雪碧图
            var retinaSprite = function () {
                var regex = new RegExp('.*(slice\\/[\\w\\d\\s!./\\-\\_@]*)\\.([\\w?#]+)["\']?\\)[^;}]*;?', 'ig');
                //            var regex = new RegExp('.*slice\\/(.*)\\.(\\w*)', 'ig');
                RegExp.escape = function (s) {
                    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
                };
                var retinaSliceList = [];
                var retinaImgUrlList = [];
                var retinaSpriteSize = new Object();


                for (var i = 0; i < sliceCodeList.length; i++) {
                    var key = sliceCodeList[i];
                    var retinaIconUrl = key.replace(regex, '$1') + "@2x." + key.replace(regex, '$2');
                    if(rootPath !=".") retinaIconUrl = rootPath + '/' + retinaIconUrl;
                    if (grunt.file.exists(retinaIconUrl)) {
                        var regexClassNameString = '(\\.?[^}]*?)\\s?{\\s?[^}]*?' + RegExp.escape(key);
                        var regexClassName = new RegExp(regexClassNameString, 'ig');
                        var classNameResult = data.match(regexClassName);
                        var className = classNameResult[0].replace(regexClassName, '$1');
                        var retinaItem = new Object();
                        retinaImgUrlList.push(retinaIconUrl);
                        retinaItem.className = className;
                        retinaSliceList[retinaIconUrl] = retinaItem;


                    }
                }


                if (retinaImgUrlList.length > 0) {
                    var config = that.data.options;
                    var spritedest = destDir +"sprite/" + fileName + "@2x.png";
                    config.src = retinaImgUrlList;
                    // spritesmiteh 库调用
                    spritesmith(config, function (err, result) {
                        if (err) {
                            grunt.fatal(err);
                            return callback(err);
                        }
                        else {
                            // 生成sprite
                            grunt.file.write(spritedest, result.image, { encoding: 'binary' });
                            gm(spritedest).size(function (err, size) {
                                if (!err) {
                                    retinaSpriteSize = size;
                                    if (retinaSpriteSize.width % 2 == 1 || retinaSpriteSize.height % 2 == 1) {
                                        grunt.fail.fatal("警告：所有的雪碧图icon尺寸必须是偶数的！请检查！");
                                    }
                                    grunt.log.writelns(("Done! [Created] -> " + spritedest));
                                    var tmpResult = result.coordinates;
                                    //                                console.log(tmpResult);
                                    for (var key in tmpResult) {
                                        retinaSliceList[ key ].sprite = tmpResult[ key ];
                                    }
                                    createRetinaCode(retinaSliceList, retinaSpriteSize);
                                    addCssStamp();
                                    callback(false);

                                }

                            });


                        }
                    });
                }
                else callback(false);
            };


            var addCssStamp = function(){
                var sourcedataurl = destCSS;
                var sourcedata = grunt.file.read(sourcedataurl);
                if(options.cssstamp) sourcedata+='.TmTStamp{content:"'+ timeNow +'"}';
                grunt.file.write(destCSS, sourcedata);

            };

            var createRetinaCode = function (retinaSliceCode, retinaSpriteSize) {
                var sourcedataurl = destCSS;
                var sourcedata = grunt.file.read(sourcedataurl);
                var retinaCssCode = '';
                var img;
                retinaCssCode += '\n\n@media only screen and (-webkit-min-device-pixel-ratio: 1.5),only screen and (min--moz-device-pixel-ratio: 1.5),only screen and (min-resolution: 240dpi) \n{';
                for (var key in retinaSliceCode) {
                    img = retinaSliceCode[key].sprite;
                    retinaCssCode += retinaSliceCode[key].className;
                    retinaCssCode += '{background-image:url("../sprite/' + fileName + '@2x.png';
                    if(options.imagestamp) retinaCssCode+="?"+timeNow;
                    retinaCssCode +='");';
                    retinaCssCode += 'background-position: -' + (img.x) / 2 + 'px -' + (img.y) / 2 + 'px;background-size:' + (retinaSpriteSize.width) / 2 + 'px;}';
                }
                retinaCssCode += '\n}\n';
                sourcedata += retinaCssCode;
                grunt.file.write(destCSS, sourcedata);
                grunt.log.writelns(("Done! [Retina 2x] -> " + destCSS));
            };

            getSliceList();
            createSprite();

        };


        // Process starter

        // 删掉之前生成的雪碧图
        for(var key in this.files){
            var file = this.files[key];
            //log(file);
            //log('file src'+file.src);
            var spritePath = path.join(path.dirname(file.src),'..','sprite');

            log('sprite path : ----- '+spritePath);
            //if the sprite dir path is exists
            if(grunt.file.exists(spritePath)) {
                grunt.file.delete(spritePath);
            }
            break;
        }


        grunt.util.async.forEachSeries(this.files, _spriteSmithWrapper, function (err) {
            done();
        });

    });

};

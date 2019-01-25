$(function () {
    initCss();

    var vConsole = new VConsole();

    var delParent;
    var defaults = {
        fileType : ["jpg","png","bmp","jpeg"],  // 上传文件的类型
        fileSize : 1024 * 1024 * 5              // 上传文件的大小 5M
    };

    //图片结果集
    var upImgArr = [];

    var FILE = $(".file");

    //当为图片预览时，防止点击触发上传操作
    FILE.click(function () {
        var __MUI_PREVIEWIMAGE = $('#__MUI_PREVIEWIMAGE');
        var style__MUI_PREVIEWIMAGE = __MUI_PREVIEWIMAGE.attr('style');

        if(style__MUI_PREVIEWIMAGE === 'display: block;'){
            event.preventDefault();
            event.stopPropagation();
        }

    });

    /*点击图片的文本框*/
    FILE.change(function(){
        var idFile = $(this).attr("id");

        var file = document.getElementById(idFile);

        //存放图片的父亲元素
        var imgContainer = $(this).parents(".z_photo");

        //获取的图片文件
        var fileList = file.files;

        //遍历得到的图片文件
        var numUp = imgContainer.find(".up-section").length;

        //总的数量
        var totalNum = numUp + fileList.length;

        if(fileList.length > 1 || totalNum > 8){
            //一次选择上传超过1个 或者是已经上传和这次上传的到的总数也不可以超过8个
            alert('一次只能添加一张照片');
        } else if (numUp < 8){
            var date = new Date().getTime();

            fileList = validateUp(fileList);

            //未通过图片判断停止继续
            if(fileList.length === 0){
                return false;
            }

            fileList[0].date = date;

            /**************************************************************************************************/
            // 压缩图片需要的一些元素和对象
            var reader = new FileReader();

            var img = new Image();

            // 缩放图片需要的canvas
            var canvas = document.createElement('canvas');

            var context = canvas.getContext('2d');

            //图片大小
            var fileSize = fileList[0].size;

            reader.readAsDataURL(fileList[0]);

            reader.onload = function(e) {
                //e.target.result就是图片的base64地址信息
                img.src = e.target.result;
            };

            img.onload = function(e) {

                EXIF.getData(img, function() {

                    var Orientation = EXIF.getTag(this, 'Orientation');
                    console.log('方向:' + Orientation);
                    console.log('大小:' + fileSize/(1024*1024));

                    var wph = (img.height*1)/(img.width*1);
                    var hpw = wph.toFixed(2)*1;
                    var square = 700;   //定义画布的大小，也就是图片压缩之后的像素
                    var imageWidth = 0;    //压缩图片的大小
                    var imageHeight = 0;
                    var offsetX = 0;
                    var offsetY = 0;
                    var hsquare = Math.ceil(square*hpw);

                    var u = navigator.userAgent;
                    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

                    if(isiOS){
                        if(Orientation === 6){
                            canvas.width = hsquare;
                            canvas.height = square;
                            context.clearRect(0, 0, hsquare, square);
                        }else if(Orientation === 8){
                            canvas.width = hsquare;
                            canvas.height = square;
                        }else{
                            canvas.width = square;
                            canvas.height = hsquare;
                            context.clearRect(0, 0, square, hsquare);
                        }
                    }else{
                        canvas.width = square;
                        canvas.height = hsquare;
                        context.clearRect(0, 0, square, hsquare);
                    }

                    if(isiOS){
                        var degree;
                        switch(Orientation){
                            case 3:
                                degree = 180;
                                imageWidth = -square;
                                imageHeight = -hsquare;
                                break;
                            case 6:
                                degree = 90;
                                imageWidth = square;
                                imageHeight = -hsquare;
                                break;
                            case 8:
                                degree = 270;
                                imageWidth = -square;
                                imageHeight = hsquare;
                                break;
                            default:
                                degree = 0;
                                imageWidth = square;
                                imageHeight = hsquare;
                        }
                        context.rotate(degree * Math.PI / 180.0);
                    }else{
                        if (img.width > img.height) {
                            imageWidth = square;
                            imageHeight = hsquare;
                            offsetX = - Math.round((imageWidth - square) / 2);
                        } else {
                            imageHeight = hsquare;
                            imageWidth = square;
                            offsetY = - Math.round((imageHeight - hsquare) / 2);
                        }
                    }
                    context.drawImage(this, offsetX, offsetY, imageWidth, imageHeight);

                    var blob = canvas.toDataURL('image/jpeg', 1.0);

                    var blobs = toBlob(blob);

                    blobs.date = date;

                    //将图片放入缓存中
                    upImgArr.push(blobs);

                    //上传TODO
                    //upload(blob, date);

                    var $section = $("<span class='up-section fl loading ' data-date='" + date + "'>");
                    imgContainer.prepend($section);

                    var $span = $("<span class='up-span'>");
                    $span.appendTo($section);

                    var $img0 = $("<img class='close-upimg'>").on("click",function(event){
                        event.preventDefault();
                        event.stopPropagation();
                        $(".works-mask").show();
                        delParent = $(this).parent();
                    });

                    $img0.attr("src","img/a7.png").appendTo($section);

                    var $img = $("<img class='up-img up-opcity' data-preview-src='' data-preview-group='1'>");
                    $img.css("background",'url(' + blob + ')').css('background-size', 'cover');
                    $img.appendTo($section);

                    var $p = $("<p class='img-name-p'>");
                    $p.html(fileList[0].name).appendTo($section);

                    var $input = $("<input id='taglocation' name='taglocation' value='' type='hidden'>");
                    $input.appendTo($section);

                    var $input2 = $("<input id='tags' name='tags' value='' type='hidden'/>");
                    $input2.appendTo($section);

                    setTimeout(function(){
                        $(".up-section").removeClass("loading");
                        $(".up-img").removeClass("up-opcity");
                    }, 450);

                    numUp = imgContainer.find(".up-section").length;

                    if(numUp >= 8){
                        $('.z_file').hide();
                    }

                    //input内容清空
                    $(this).val("");

                    initCss();

                    initImg();

                    console.log(upImgArr);

                });

            };

        }

    });

    $(".z_photo").delegate(".close-upimg","click",function(){
        $(".works-mask").show();
        delParent = $(this).parent();
    });

    $(".wsdel-ok").click(function(){
        $(".works-mask").hide();
        var numUp = delParent.siblings().length;

        if(numUp < 9){
            delParent.parent().find(".z_file").show();
        }

        var date = delParent.attr('data-date');

        delParent.remove();

        //同时将缓存中的图片删除
        for(var i=0;i<upImgArr.length;i++){
            if(upImgArr[i].date == date){
                upImgArr.splice(i, 1);
            }
        }

        initCss();

    });

    $(".wsdel-no").click(function(){
        $(".works-mask").hide();
    });

    function validateUp(files){
        //替换的文件数组
        var arrFiles = [];

        //不能上传文件名重复的文件
        for(var i = 0, file; file = files[i]; i++){

            //获取文件上传的后缀名
            var newStr = file.name.split("").reverse().join("");

            if(newStr.split(".")[0] != null){

                var type = newStr.split(".")[0].split("").reverse().join("");

                if(jQuery.inArray(type, defaults.fileType) > -1){
                    // 类型符合，可以上传
                    if (file.size >= defaults.fileSize) {
                        alert(file.name + '文件过大');
                    } else {
                        // 在这里需要判断当前所有文件中
                        arrFiles.push(file);
                    }
                }else{
                    alert(file.name + '上传类型不符合');
                }
            }else{
                alert(file.name +'"没有类型, 无法识别');
            }
        }

        return arrFiles;

    }

    //base64转blob
    function toBlob(urlData) {
        var bytes = window.atob(urlData.split(',')[1]);
        // 去掉url的头，并转换为byte
        // 处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }
        return new Blob([ab],{type : 'image/jpeg'});
    }

    function initCss() {
        var consultImg = $('.consult-img');
        var consultImgWidth = ((consultImg.innerWidth())-20)/4 + 'px';

        $('.upimg-div .up-section').css('width', consultImgWidth).css('height', consultImgWidth);
        $('.img-box .upimg-div .z_file').css('width', consultImgWidth).css('height', consultImgWidth);
        $('.z_file .add-img').css('width', consultImgWidth).css('height', consultImgWidth);
        $('.up-img').css('width', consultImgWidth).css('height', consultImgWidth);
        $('.z_photo .z_file').css('width', consultImgWidth).css('height', consultImgWidth);

        var upSection = $('.up-section');
        var upSectionLength = upSection.length;

        if(upSectionLength === 0 || upSectionLength === 4){
            $('.z_photo .z_file').css('margin-left', '2px');
        }else{
            $('.z_photo .z_file').css('margin-left', '-8px');
        }
    }

    //mui图片预览
    function initImg() {
        //data-preview-src="" data-preview-group="1"
        //mui.previewImage();
    }

    //上传图片方法
    function submitImg() {
        var uploadImg = [];

        for(var i=0;i<(upImgArr).length;i++){
            if(upImgArr[i] !== undefined){
                uploadImg.push(upImgArr[i]);
            }
        }

        //创建formData对象
        var fd = new FormData();

        for(var x=0;x<(uploadImg).length;x++){
            fd.append('name', uploadImg[x], x + '.jpg');
        }

        $.ajax({
            async: false,
            method: 'post',
            processData : false,
            contentType: false,
            url: 'http://192.168.1.131:8080/rest/consult/mediaFiles/wx/',
            data: fd,
            success:function (data) {
                console.log(data);

            },
            error:function (err) {
                console.log(err);
            }
        });
    }

    function upload(base64, date) {
        var blob = toBlob(base64);
        var fd = new FormData();

        fd.append('name', blob, date + '.jpg');

        $.ajax({
            async: false,
            method: 'post',
            processData : false,
            contentType: false,
            url: 'http://ngresume.com/home/upload/upload',
            data: fd,
            success:function (Data) {
                mui.hideLoading();

                // var src = (Data.data)[0];
                // for(var i=0;i<($scope.upImgContainer).length;i++){
                //     var arr = ($scope.upImgContainer)[i];
                //     var arrDate = arr.date;
                //     if(date === arrDate){
                //         ($scope.upImgContainer)[i].src = src;
                //     }
                // }

                //$scope.recentlyImg = src;

            },
            error:function (err) {
                mui.hideLoading();
            }
        });
    }

});

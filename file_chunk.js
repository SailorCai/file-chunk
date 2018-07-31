//文件分片上传部分开始
(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals (with support for web workers)
        var glob;

        try {
            glob = window;
        } catch (e) {
            glob = self;
        }

        glob.mtpChunk = factory();
    }
}(function (undefined) {
    //md5 模块开始
            var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                //log = document.getElementById('log'),
                input = document.getElementById('add_tool_file'),
                running = false, running1 = false, running2 = false, running3 = false, running4 = false,
                ua = navigator.userAgent.toLowerCase();

            function registerLog(str, className) {
                var elem = document.createElement('div');

                elem.innerHTML = str;
                elem.className = 'alert-message' + (className ? ' '  + className : '');
                //log.appendChild(elem);
            }

            function doIncrementalTest(option) {
                if (running) {
                    return;
                }

                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                    //file = input.files[0],
                    //chunkSize = 5242880,                           // read in chunks of 5MB
                    chunkSize = 10485760,                           // read in chunks of 10MB
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0,
                    spark = new SparkMD5.ArrayBuffer(),
                    time,
                    uniqueId = 'chunk_' + (new Date().getTime()),
                    chunkId = null,
                    fileReader = new FileReader();

                fileReader.onload = function (e) {
                    console.log((currentChunk + 1),chunks);
                    if (currentChunk === 0) {
                        registerLog('Read chunk number <strong id="' + uniqueId + '">' + (currentChunk + 1) + '</strong> of <strong>' + chunks + '</strong><br/>', 'info');
                    } else {
                        if (chunkId === null) {
                            chunkId = document.getElementById(uniqueId);
                        }

                        //chunkId.innerHTML = currentChunk + 1;
                    }

                    spark.append(e.target.result);                 // append array buffer
                    currentChunk += 1;

                    if (currentChunk < chunks && option.whole) {
                        loadNext();
                    } else {
                        running = false;
                        var md5 = spark.end();
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        /*option.chunk_md5 = spark.end();
                        console.log(option);
                        upload_chunk(option);*/
                        console.log(md5);
                        if(option && option.callback){
                            //option.md5 = md5;
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running = false;
                    registerLog('<strong>Oops, something went wrong.</strong>', 'error');
                };

                function loadNext() {
                    //start和end由外部传入
                    var start = currentChunk * chunkSize,
                        end = start + chunkSize >= file.size ? file.size : start + chunkSize;
                    //var start = option.start, end = option.end;

                    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                    //option.chunk_file = blobSlice.call(file, start, end);
                }

                running = true;
                registerLog('<p></p><strong>Starting incremental test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                loadNext();
            }

            function doNormalTest(option) {
                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if (running) {
                    return;
                }

                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var fileReader = new FileReader();
                var time;

                fileReader.onload = function (e) {
                    running = false;

                    if (file.size != e.target.result.byteLength) {
                        registerLog('<strong>ERROR:</strong> Browser reported success but could not read the file until the end.<br/>', 'error');
                    } else {
                        var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        //console.log(SparkMD5.ArrayBuffer.hash(e.target.result));
                        if(option && option.callback){
                            //option.md5 = md5;
                            console.log(md5);
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running = false;
                    registerLog('<strong>ERROR:</strong> FileReader onerror was triggered, maybe the browser aborted due to high memory usage.<br/>', 'error');
                };

                running = true;
                registerLog('<strong>Starting normal test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                fileReader.readAsArrayBuffer(file);
            }
            function doNormalTest1(option) {
                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if (running1) {
                    return;
                }

                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var fileReader = new FileReader();
                var time;

                fileReader.onload = function (e) {
                    running1 = false;

                    if (file.size != e.target.result.byteLength) {
                        registerLog('<strong>ERROR:</strong> Browser reported success but could not read the file until the end.<br/>', 'error');
                    } else {
                        var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        //console.log(SparkMD5.ArrayBuffer.hash(e.target.result));
                        if(option && option.callback){
                            //option.md5 = md5;
                            console.log(md5);
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running1 = false;
                    registerLog('<strong>ERROR:</strong> FileReader onerror was triggered, maybe the browser aborted due to high memory usage.<br/>', 'error');
                };

                running1 = true;
                registerLog('<strong>Starting normal test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                fileReader.readAsArrayBuffer(file);
            }
            function doNormalTest2(option) {
                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if (running2) {
                    return;
                }

                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var fileReader = new FileReader();
                var time;

                fileReader.onload = function (e) {
                    running2 = false;

                    if (file.size != e.target.result.byteLength) {
                        registerLog('<strong>ERROR:</strong> Browser reported success but could not read the file until the end.<br/>', 'error');
                    } else {
                        var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        //console.log(SparkMD5.ArrayBuffer.hash(e.target.result));
                        if(option && option.callback){
                            //option.md5 = md5;
                            console.log(md5);
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running2 = false;
                    registerLog('<strong>ERROR:</strong> FileReader onerror was triggered, maybe the browser aborted due to high memory usage.<br/>', 'error');
                };

                running2 = true;
                registerLog('<strong>Starting normal test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                fileReader.readAsArrayBuffer(file);
            }

            function doNormalTest3(option) {
                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if (running3) {
                    return;
                }

                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var fileReader = new FileReader();
                var time;

                fileReader.onload = function (e) {
                    running3 = false;

                    if (file.size != e.target.result.byteLength) {
                        registerLog('<strong>ERROR:</strong> Browser reported success but could not read the file until the end.<br/>', 'error');
                    } else {
                        var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        //console.log(SparkMD5.ArrayBuffer.hash(e.target.result));
                        if(option && option.callback){
                            //option.md5 = md5;
                            console.log(md5);
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running3 = false;
                    registerLog('<strong>ERROR:</strong> FileReader onerror was triggered, maybe the browser aborted due to high memory usage.<br/>', 'error');
                };

                running3 = true;
                registerLog('<strong>Starting normal test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                fileReader.readAsArrayBuffer(file);
            }

            function doNormalTest4(option) {
                var input, file;
                if(option.inputId){
                    input = document.getElementById(option.inputId);
                };
                if (running4) {
                    return;
                }

                if(option.chunk){
                    file = option.chunk;
                }else if(option.file){
                    file = option.file;
                }else if(input && input.files.length){
                    file = input.files[0];
                }else{
                    registerLog('<strong>Please select a file.</strong><br/>');
                    return;
                }

                var fileReader = new FileReader();
                var time;

                fileReader.onload = function (e) {
                    running4 = false;

                    if (file.size != e.target.result.byteLength) {
                        registerLog('<strong>ERROR:</strong> Browser reported success but could not read the file until the end.<br/>', 'error');
                    } else {
                        var md5 = SparkMD5.ArrayBuffer.hash(e.target.result);
                        registerLog('<strong>Finished loading!</strong><br/>', 'success');
                        registerLog('<strong>Computed hash:</strong> ' + md5 + '<br/>', 'success'); // compute hash
                        registerLog('<strong>Total time:</strong> ' + (new Date().getTime() - time) + 'ms<br/>', 'success');
                        //console.log(SparkMD5.ArrayBuffer.hash(e.target.result));
                        if(option && option.callback){
                            //option.md5 = md5;
                            console.log(md5);
                            option.callback(option, md5);
                        };
                    }
                };

                fileReader.onerror = function () {
                    running4 = false;
                    registerLog('<strong>ERROR:</strong> FileReader onerror was triggered, maybe the browser aborted due to high memory usage.<br/>', 'error');
                };

                running4 = true;
                registerLog('<strong>Starting normal test (' + file.name + ')</strong><br/>', 'info');
                time = new Date().getTime();
                fileReader.readAsArrayBuffer(file);
            }

            function clearLog() {
                if (!running) {
                    //log.innerHTML = '';
                }
            }

            if (!('FileReader' in window) || !('File' in window) || !blobSlice) {
                registerLog('<p><strong>Your browser does not support the FileAPI or slicing of files.</strong></p>', 'error');
            } else {
                registerLog('Keep your devtools closed otherwise this example will be a LOT slower', 'info');

                if (/chrome/.test(ua)) {
                    if (location.protocol === 'file:') {
                        registerLog('<p><strong>This example might not work in chrome because you are using the file:// protocol.</strong><br/>You can try to start chrome with -allow-file-access-from-files argument or spawn a local server instead. This is a security measure introduced in chrome, please <a target=\'_blank\' href=\'http://code.google.com/p/chromium/issues/detail?id=60889\'>see</a>.</p>');
                    }
                }

                //document.getElementById('normal').addEventListener('click', doNormalTest);
                //document.getElementById('incremental').addEventListener('click', doIncrementalTest);
                //document.getElementById('clear').addEventListener('click', clearLog);
            }

//md5 模块结束
    function mtpChunk() {
        // call reset to init the instance
        //this.reset();
        //return this;
    };

    // 申请分片上传
    var chunk_arr = [];
    var all_over = false;
    var chunk_apply = function (params, md5) {
        params.loopCount++; 
        if(params.loopCount > 2){  // 如果连续上传两次都没上传完就弹框提示
            $("#alert").dialog("open")
            $("#alert_html").text("上传失败");
            return;
            //$('#dialog_add').dialog('close');
        };
        var file = params.file;
        var file_name = file.name;
        var file_size = file.size;
        var request_cond = {
            file_name: file_name,
            file_size: file_size,
            file_md5: md5,
            game_id: params.game_id,
            page_type: 'request_upload'
        };
        if(!request_cond.game_id){
            alert('请先选择游戏');
            return;
        };
        gs.func.callCgi(gs.cgi.add_shell_chunk, request_cond, function(result) {
            //console.log(result);
            var idx_arr = result.info.chunk_list;
            var current_i = 0;
            if(result.ret==0 && idx_arr.length>0){
                idx_arr.forEach(function(item, index){
                    for(var i=item[0]; i<=item[1]; i++){
                        chunk_arr.push(i);
                    };
                });
                if(params.progress){
                    // 执行滚动条方法
                    params.progress({
                        finish: 0,
                        sum: result.info.chunk_count,
                        total: file_size
                    });
                };
                if(chunk_arr.length>=5){
                    for(var i=0; i<5; i++){
                        goUpload(i);
                    };
                }else{
                    goUpload(0);
                };
                function goUpload (i){
                    current_i = Number(chunk_arr.shift());
                    var start = current_i*Number(result.info.chunk_size);
                    var end = Math.min(start+Number(result.info.chunk_size), file_size);
                    //console.log(start, end);
                    params.line = i;
                    params.start = start;
                    params.end = end;
                    params.whole = false;
                    params.count = current_i;
                    params.file_md5 = md5;
                    params.chunk_size = Math.min(result.info.chunk_size, (end-start));
                    params.file_size = file_size;
                    params.chunk_count = result.info.chunk_count;
                    params.callback = chunk_upload;
                    var chunk_file = file.slice(params.start, params.end);
                    params.chunk = chunk_file;
                    var option = {}, option1 = {}, option2 = {}, option3 = {}, option4 = {};
                    //doIncrementalTest(option);
                    if(i==0){
                        for(var key in params){
                            option[key] = params[key];
                        };
                        doNormalTest(option);
                        option.md5Func = doNormalTest;
                    }else if(i==1){
                        for(var key in params){
                            option1[key] = params[key];
                        };
                        doNormalTest1(option1);
                        option1.md5Func = doNormalTest1;
                    }else if(i==2){
                        for(var key in params){
                            option2[key] = params[key];
                        };
                        doNormalTest2(option2);
                        option2.md5Func = doNormalTest2;
                    }else if(i==3){
                        for(var key in params){
                            option3[key] = params[key];
                        };
                        doNormalTest3(option3);
                        option3.md5Func = doNormalTest3;
                    }else if(i==4){
                        for(var key in params){
                            option4[key] = params[key];
                        };
                        doNormalTest4(option4);
                        option4.md5Func = doNormalTest4;
                    };
                };

            }else if(result.ret==0 && idx_arr.length<=0){
                console.log('上传完成');
                if(params.progress){
                    // 执行滚动条方法
                    params.progress({
                        finish: result.info.chunk_count,
                        sum: result.info.chunk_count,
                        total: file_size
                    });
                };
                if(params.success){
                    params.file_md5 = md5;
                    params.success(params);
                };
                return;
            };
        })
    };
    mtpChunk.prototype.apply = chunk_apply;

    // 开始分片上传
    var chunk_upload = function (data, md5) {
        //console.log(chunk_arr);
        var start = data.count*data.chunk_size;
        var end = Math.min(data.file.size, start + data.chunk_size);
        var chunk_md5 = md5
        var file = data.file;
        var file_name = data.file.name;
        var file_size = data.file.size;

        var form = new FormData();
        form.append('file_name', file_name);
        form.append('file_size', file_size);
        form.append('file_md5', data.file_md5);
        form.append('chunk_md5', md5);
        form.append('chunk_idx', data.count);
        form.append('chunk_size',  Math.min(data.chunk_size, (end-start)));
        form.append('game_id', data.game_id);
        form.append('page_type', 'upload_chunk');
        var chunk_file = data.file.slice(data.start, data.end);
        chunk_file.name = file_name;
        form.append('chunk_file', chunk_file);
        gs.func.callCgi_file(gs.cgi.add_shell_chunk2, form, function(result) {
            if(chunk_arr.length > 0){
                var current_i = Number(chunk_arr.shift());
            }else{
                var current_i = Number(data.chunk_count);
            };
            if(current_i == data.count-1){
                data.islast = true;
            }else{
                data.islast = false;
            };
            if(data.progress){
                // 执行滚动条方法
                data.progress({
                    finish: current_i,
                    sum: data.chunk_count,
                    total: file_size
                });
            };
            if((result.ret == 0 && current_i < data.chunk_count) || (result.ret == -1 && result.info == '文件分片已经上传')){
                var start = Number(current_i*data.chunk_size);
                var end = Math.min(start+Number(data.chunk_size), file_size);
                data.start = start;
                data.end = end;
                data.whole = false;
                data.count = current_i;
                data.chunk_size = Math.min(data.chunk_size, (end-start));
                data.file_size = file_size;
                data.callback = chunk_upload;
                if(data.line == 0){
                    var option = {};
                    for(var key in data){
                        option[key] = data[key];
                    };
                    var chunk_file = file.slice(option.start, option.end);
                    option.chunk = chunk_file;
                    data.md5Func(option);
                }else if(data.line == 1){
                    var option1 = {};
                    for(var key in data){
                        option1[key] = data[key];
                    };
                    var chunk_file = file.slice(option1.start, option1.end);
                    option1.chunk = chunk_file;
                    data.md5Func(option1);
                }else if(data.line == 2){
                    var option2 = {};
                    for(var key in data){
                        option2[key] = data[key];
                    };
                    var chunk_file = file.slice(option2.start, option2.end);
                    option2.chunk = chunk_file;
                    data.md5Func(option2);
                }else if(data.line == 3){
                    var option3 = {};
                    for(var key in data){
                        option3[key] = data[key];
                    };
                    var chunk_file = file.slice(option3.start, option3.end);
                    option3.chunk = chunk_file;
                    data.md5Func(option3);
                }else if(data.line == 4){
                    var option4 = {};
                    for(var key in data){
                        option4[key] = data[key];
                    };
                    var chunk_file = file.slice(option4.start, option4.end);
                    option4.chunk = chunk_file;
                    data.md5Func(option4);
                };
            }else if((result.ret==1 && current_i>=data.chunk_count) || (result.ret==-1 && result.info=='文件分片已经上传' &&  current_i>=data.chunk_count)){
                console.log("上传完成！！！");
                /*if(data.success){
                    data.success(data);
                };*/
                //上传完最后一片再调一次第一个接口
                if(!all_over){
                    all_over = true;
                    chunk_apply(data, data.file_md5);
                };
            }else if(result.ret==0 && current_i>=data.chunk_count){
                return;
            }else{
                $("#alert").dialog("open");
                $("#alert_html").text(result.info);
                $('#dialog_add').dialog('close');
            };
        });
    };
    mtpChunk.prototype.upload = chunk_upload;

    // 开始计算md5};
    mtpChunk.prototype.start = function (params) {
        var option = {
            file: params.file,
            game_id: params.game_id,
            game_name: params.game_name,
            progress: params.progress,
            success: params.success,
            callback: chunk_apply,
            loopCount: 0,
            whole: true
        };
        console.log(option.file);
        //文件大于500M时用分片方法计算md5
        if(option.file.size > 500*1024*1024){
            doIncrementalTest(option);
        }else{
            doNormalTest(option);
        };
    };


    return new mtpChunk();
}));

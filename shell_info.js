/**
 * Created by v_kninkuang on 2016/7/6.
 */
//Attr
var Fields = {
    url:gs.cgi.add_shell_info,
    url_upload:gs.cgi.add_shell_info_upload,
    head:{},
    data:{},
};
var setting = {
    view: {
        selectedMulti: false
    },
    check: {
        enable: true
    },
    data: {
        simpleData: {
            enable: true
        }
    },
};
//function
var shell_info={
    /****!游戏信息**************************************************/
    showGameInfo: function (type) {
        var htmlArray=[];
        if(type==1){
            Fields.gameInfoList.unshift({game_id:0,game_name:'请选择'});
        }else if(type==2){
            Fields.gameInfoList.unshift({game_id:0,game_name:'不区分游戏'});
        }
        for(var i in Fields.gameInfoList){
            htmlArray.push('<option value="' + Fields.gameInfoList[i].game_id + '">' +'['+Fields.gameInfoList[i].game_id+']'+ Fields.gameInfoList[i].game_name + '</option>');
        }
        $('[game_info]').html(htmlArray.join(""));
    },
    getGameInfo: function () {
        var request_cond={
            page_type:5,
        }
        gs.func.callCgi(gs.cgi.shell_game_cfg, request_cond, function(result) {
            Fields.gameInfoList=result.info;
            shell_info.showGameInfo(1);
        })
    },
    /****!show 数据查询**************************************************/
    showOperation:function(row, key, idx, val){
        var opera='<input type="button" action="mod_table" class="btn btn-primary" row_num="'+idx+'" value="详情信息">&nbsp;&nbsp;'
            +'<input type="button" action="del_table" class="btn btn-primary" row_num="'+row.id+'" value="删除">';
        return opera;
    },
    showLog: function (row, key, idx, val) {
        var a='<a href="'+row.log_url+'" target="_blank">'+row.log_name+'</a>'
        return a;
    },
    showShell: function (row, key, idx, val) {
        var a='<a href="'+row.apk_shell_url+'">'+row.apk_shell_name+'</a>'
        return a;
    },
    showApk: function (row, key, idx, val) {
        var a='<a href="'+row.apk_url+'">'+row.apk_name+'</a>'
        return a;
    },
    showConfig: function(row, key, idx, val) {
        var a='<a href="'+row.app_cfg_url+'">'+row.app_cfg_name+'</a>'
        return a;
    },
    fieldsInfo: function (res) {
        for(var key in res.fileds){
            Fields.head[res.fileds[key]] = {
                thText: res.fileds_desc[key],
                needOrder: false
            };
        }
        Fields.head.apk= {thText: 'APK文件', render:shell_info.showApk, needOrder: false, width:"8%"};
        Fields.head.shell= {thText: '加壳APK', render:shell_info.showShell, needOrder: false, width:"8%"};
        Fields.head.log= {thText: '加壳日志', render:shell_info.showLog, needOrder: false, width:"8%"};
        Fields.head.appConf= {thText: 'APP配置', render:shell_info.showConfig, needOrder: false, width:"8%"};
        Fields.head.Operation= {thText: '操作', render:shell_info.showOperation, needOrder: false, width:"10%"};
        Fields.data=res.info;
    },
    showData:function(){
        var game_id=$(".select2").select2("val");
        var request_cond={
            page_type:"get_info",
            'game_id':game_id
        }

        gs.func.callCgi(Fields.url, request_cond, function(result) {
            shell_info.fieldsInfo(result.info);
            Gri.initDataTable({
                tableId: 'list',
                data: result.info.info,
                layout: 'fixed',
                keyIndex: 'Id',
                allFields: Fields.head, // 不同type，返回数据结构不一样
                page: {
                    orderField: "Id",
                    orderType: "asc",
                    ifRealPage: 0,
                    size: 50,
                    rowCount: result.info.info.length,
                    index: 0
                }
            });
        })

    },
    /****!add 数据添加**************************************************/
    radioList:function(arr,name,must,chk){
        //console.log(dom)
        var html='';
        for(var i in arr){
            var str='';
            _.each(chk,function(v){
                if(v==arr[i]){
                    str='checked';
                }
            })
            _.each(must,function(v){
                if(v==arr[i]){
                    str='checked disabled';
                }
            })
            html+='<label class="col-md-6"><input type="checkbox" value="'+arr[i]+'" name="'+name+'" '+ str+'>'+arr[i]+'</label>';
        }
        return html;
    },
    addDataParam:function(){
        var request_cond={
            page_type:"add_info",
            game_id:$('#add_game_id').val(),
        }
        return request_cond;
    },
    addData: function () {
        var request_cond={
            page_type:"add_info",
            game_id:$('#add_game_id').val(),
        }
        var game_name = $('#add_game_id option:selected').text().split(']')[1];
        if(request_cond.game_id==0){
            $("#alert").dialog("open")
            $("#alert_html").text('请选择游戏');
            return;
        }
        var bar = $('.bar');
        var percent = $('.percent');
        var status = $('#status');

        // 在此添加判断，如果勾选了分片则调用分片方法
        console.log($('#dialog_add #add_apk_chunk').attr('checked'));
        if($('#dialog_add #add_apk_chunk').attr('checked')){
            var file = $('#add_apk_file')[0].files[0];
            if(file){   // && file.size >= 1024*1024*10
                $("#jj").html("文件md5计算中...");
                mtpChunk.start({
                    file: file, 
                    game_id: request_cond.game_id,
                    game_name: game_name,
                    progress: function(data){
                        $("#jj").html("");
                        var percentVal = Math.ceil((data.finish/data.sum)*100)+'%';
                        var position = data.total*(data.finish/data.sum);
                        if(data.total/(1024*1024) > 1){
                            var sum = Math.ceil(data.total/(1024*1024)) + "M";
                        }
                        else {
                            var sum = Math.ceil(data.total/1024) + "KB";
                        }
                        if(position/(1024*1024) > 1){
                            var sum1 = Math.ceil(position/(1024*1024)) + "M";
                        }
                        else {
                            var sum1 = Math.ceil(position/1024) + "KB";
                        }
                        $("#jj").html("上传文件总大小：" + sum + ",已上传：" +  sum1);
                        $(".progress").show();
                        status.empty();
                        bar.width(percentVal);
                        percent.html(percentVal);
                    },
                    success: function(data){
                        $(".progress").show();
                        status.empty();
                        bar.width('100%');
                        percent.html('100%');
                        shell_info.shell_apply(data);
                    }
                });
            }/*else if(file && file.size < 1024*1024*10){
                $("#alert").dialog("open");
                $("#alert_html").text('文件小于10M，请使用普通方式上传');
            }*/else{
                $("#alert").dialog("open");
                $("#alert_html").text('请选择文件');
            };
            return;
        };

        $('#add_contents').ajaxSubmit({
            url: Fields.url_upload,
            data:request_cond,
            type: 'post',
            dataType: 'json',
            beforeSend: function() {
                $(".progress").show();
                //$(".total").show();
                status.empty();
                var percentVal = '0%';
                bar.width(percentVal);
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                if(total/(1024*1024) > 1){
                    var sum = Math.ceil(total/(1024*1024)) + "M";
                }
                else {
                    var sum = Math.ceil(total/1024) + "KB";
                }
                if(position/(1024*1024) > 1){
                    var sum1 = Math.ceil(position/(1024*1024)) + "M";
                }
                else {
                    var sum1 = Math.ceil(position/1024) + "KB";
                }
                $("#jj").html("上传文件总大小：" + sum + ",已上传：" +  sum1);
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
                //console.log(percentVal, position, total);
            },
            success: function(jsonString) {
                console.log(jsonString);
                $("#alert").dialog("open")
                $("#alert_html").text(jsonString.info);

                if (jsonString.ret == 0) {
                    $("#dialog_add").dialog("close");
                    shell_info.showData();
                    //shell_info.hiddenDialog()
                }
            }
        });
    },
    //自定义加壳文件上传
    addCustom:function(){
        var request_cond={
            page_type:'add_info_custom',
            game_id:$('#game_custom_id').val(),
        }
        var game_name = $('#game_custom_id option:selected').text().split(']')[1];
        if(request_cond.game_id==0){
            $("#alert").dialog("open")
            $("#alert_html").text('请选择游戏');
            return;
        }
        var bar = $('.bar');
        var percent = $('.percent');
        var status = $('#status1');

        // 在此添加判断，如果勾选了分片则调用分片方法
        console.log($('#dialog_add #add_apk_chunk2').attr('checked'));
        if($('#dialog_custom_add #add_apk_chunk2').attr('checked')){
            var file = $('#add_tool_file')[0].files[0];
            if(file){
                $("#jj").html("文件md5计算中...");
                mtpChunk.start({
                    file: file, 
                    game_id: request_cond.game_id,
                    game_name:game_name,
                    progress: function(data){
                        $("#jj1").html("");
                        var percentVal = Math.ceil((data.finish/data.sum)*100)+'%'
                        var position = data.total*(data.finish/data.sum);
                        if(data.total/(1024*1024) > 1){
                            var sum = Math.ceil(data.total/(1024*1024)) + "M";
                        }
                        else {
                            var sum = Math.ceil(data.total/1024) + "KB";
                        }
                        if(position/(1024*1024) > 1){
                            var sum1 = Math.ceil(position/(1024*1024)) + "M";
                        }
                        else {
                            var sum1 = Math.ceil(position/1024) + "KB";
                        }
                        $("#jj1").html("上传文件总大小：" + sum + ",已上传：" +  sum1);
                        $(".progress").show();
                        status.empty();
                        bar.width(percentVal);
                        percent.html(percentVal);
                    },
                    success: function(data){
                        $(".progress").show();
                        status.empty();
                        bar.width('100%');
                        percent.html('100%');
                        shell_info.shell_apply(data);
                    }
                });
            }else{
                $("#alert").dialog("open");
                $("#alert_html").text('请选择文件');
            };
            return;
        };

        $('#add_custom_contents').ajaxSubmit({
            url: Fields.url_upload,
            data:request_cond,
            type: 'post',
            dataType: 'json',
            beforeSend: function() {
                $(".progress").show();
                //$(".total").show();
                status.empty();
                var percentVal = '0%';
                bar.width(percentVal)
                percent.html(percentVal);
            },
            uploadProgress: function(event, position, total, percentComplete) {
                if(total/(1024*1024) > 1){
                    var sum = Math.ceil(total/(1024*1024)) + "M";
                }
                else {
                    var sum = Math.ceil(total/1024) + "KB";
                }
                if(position/(1024*1024) > 1){
                    var sum1 = Math.ceil(position/(1024*1024)) + "M";
                }
                else {
                    var sum1 = Math.ceil(position/1024) + "KB";
                }
                $("#jj1").html("上传文件总大小：" + sum + ",已上传：" +  sum1);
                var percentVal = percentComplete + '%';
                bar.width(percentVal)
                percent.html(percentVal);
                //console.log(percentVal, position, total);
            },
            success: function(result) {
                //console.log(JSON.stringify(result))
                if(result.ret==0){
                    $('#dialog_custom_chk').dialog('open');
                    Fields.customChk=result.info;
                    shell_info.createNavDom(result);
                    var disable_shell_value = result.info.tpshell_cfg.disable_shell;
                    var auto_add_mtp = result.info.tpshell_cfg.auto_add_mtp;
                    var enable_partial_record = result.info.tpshell_cfg.enable_partial_record;
                    $('[name="disable_shell"][value="'+disable_shell_value+'"]').prop("checked",true)
                    $('[name="auto_add_mtp"][value="'+auto_add_mtp+'"]').prop("checked",true)
                    $('[name="check_shell"][value="'+enable_partial_record+'"]').prop("checked",true)
                }else{
                    $("#alert").dialog("open")
                    $("#alert_html").text(result.info);
                }
            }
        });

    },
    //分片上传后申请加壳方法
    shell_apply:function(data){
        var file = data.file;
        var file_name = file.name;
        var file_size = file.size;
        var request_cond = {
            file_name: file_name,
            file_size: file_size,
            file_md5: data.file_md5,
            game_id: data.game_id,
            game_name: data.game_name,
            page_type: 'do_add_shell'
        };
        gs.func.callCgi(gs.cgi.add_shell_chunk, request_cond, function(result) {
            console.log(result);
            $("#alert").dialog("open")
            $("#alert_html").text(result.info);
            $('#dialog_add').dialog('close');
        })
    },
    //自定义加壳 配置 zTree配置
    setData:function(item,zTree){
        if(item.indexOf('/')==-1){
            zTree.push({'id':item, 'pId':0, 'name':item})
            return;
        }

        var arr=item.split('/');
        // var zname=arr.pop();
        var n=[];
        for(var j=0;j<arr.length-1;j++){
            n.push(arr[j])
            if(!_.find(zTree, function(v){
                    return v.id == n.join('/')
                })){
                var idStr=n.join('/');
                if(n.length==1){
                    zTree.push({'id':idStr, 'pId':0, 'name':arr[j]})
                }else{
                    zTree.push({'id':idStr, 'pId':idStr.substr(0,idStr.lastIndexOf('/')),'name':arr[j]})
                }
            }
        }
        // console.log(arr)
        zTree.push({'id':item, 'pId':item.substr(0,item.lastIndexOf('/')), 'name':item.substr(item.lastIndexOf('/')+1,item.length)})
    },
    createNavDom:function(data){

        var apk=data.info.app_file_info.apk;
        var zTree=[];
        for(var i in apk){
            shell_info.setData(apk[i],zTree)
        }
        var sFiles=data.info.tpshell_cfg.select_files;
        for(var i in sFiles){
            for(var j in zTree){
                if(zTree[j].name==sFiles[i]){
                    zTree[j].checked=true;
                    if(zTree[j].pId==0)continue;
                    var arr=zTree[j].pId.split('/'),tmp=[];
                    for(var z in arr){
                        tmp.push(arr[z])
                        var str=tmp.join('/');
                        zTree.find(function(v){return v.id==str}).checked=true;
                    }
                }
            }
        }
        $('.dll-list').html(shell_info.radioList(data.info.app_file_info.dll,'dll',data.info.must_select.dll_list,data.info.tpshell_cfg.dll_list))
        $('.so-list').html(shell_info.radioList(data.info.app_file_info.so,'so',data.info.must_select.so_list,data.info.tpshell_cfg.so_list))
        $.fn.zTree.init($("#zTree"), setting, zTree);
    },
    //自定义加壳 配置 确定
    addCustomChk:function(data){
        //console.log(data)
        var dll_arr=[]
        $('[name="dll"]:checked').each(function(){
            dll_arr.push(this.value)
        })
        var so_arr=[]
        $('[name="so"]:checked').each(function(){
            so_arr.push(this.value)
        })

        var zTree = $.fn.zTree.getZTreeObj("zTree");
        var checkCount = zTree.getCheckedNodes(true),checkArr=[];
        for(var i in checkCount){
            var item=checkCount[i];
            if(item.check_Child_State==-1){
                checkArr.push(item.name)
            }
        }
        var request_cond={
            page_type:'do_custom_add_shell',
            id:data.id,
            game_id:$('#game_custom_id').val(),
            dll_list:JSON.stringify(dll_arr),
            so_list:JSON.stringify(so_arr),
            enable_partial_record:$('[name="enable_partial"]:checked').val(),
            select_files:JSON.stringify(checkArr),
            disable_shell:$('[name="disable_shell"]:checked').val(),
            auto_add_mtp: $('[name="auto_add_mtp"]:checked').val()
        }

        console.log(request_cond)
        gs.func.callCgi(gs.cgi.add_shell_info, request_cond, function(result) {

            if(result.ret==0){
                $('#dialog_custom_add').dialog('close')
                $('#dialog_custom_chk').dialog('close')
                shell_info.showData()
            }
            $("#alert").dialog("open")
            $("#alert_html").text(result.info);
        })
    },
    /****!mod 单个数据详情**************************************************/
    modDataRender: function (row) {
        $('#mod_game_id').val(row.game_id);
        $('#status_desc').val(row.status_desc)
        $('#status_detail').val(row.status_detail)
        $('#apk_md5').text(row.apk_md5)
        $('#apk_shell_md5').text(row.apk_shell_md5)
        $('#apk_shell_nosign_md5').text(row.apk_shell_nosign_md5)
        $('#app_cfg_md5').text(row.app_cfg_md5)
        $('#apk_size').text(row.apk_size+" 字节")
        $('#apk_shell_size').text(row.apk_shell_size+" 字节")
    },

    /****!del 数据删除**************************************************/
    delData: function (id) {
        if (confirm("是否删除本条记录？")) {
            var request_cond = new Object();
            request_cond.page_type = "del_info";
            request_cond.id =id;


            gs.func.callCgi(Fields.url, request_cond, function(jsonString) {
                console.log(jsonString);
                $("#alert").dialog("open")
                $("#alert_html").text(jsonString.info);

                if (jsonString.ret == 0) {
                    $("#dialog_mod").dialog("close");
                    shell_info.showData();
                    //shell_info.hiddenDialog()
                }
            });
        }
    },

    /****!other 其他功能**************************************************/
    hiddenDialog:function(){
        $('[aria-labelledby="ui-dialog-title-alert"]').fadeOut(3000);
        setTimeout(function(){
            $('#alert').dialog('close');
        },2500)
    },
    clearData:function(dom){
        //$('#add_game_id').val(0)
        //console.log(dom);
        $(dom+' .form-control').each(function(){
            //console.log(this)
            $(this).val('');
        })
    },
}

/*****!dialog弹出框********************************************/
    //!add添加
$('#dialog_add').dialog({
    autoOpen: false,
    width: 600,
    modal: true,
    title: "普通加壳",
    buttons: {
        "提交": function() {
            shell_info.addData();
        },
        "取消": function() {
            $(this).dialog("close");
        }
    },
    close: function() {}
})

$('#dialog_mod').dialog({
    autoOpen: false,
    width: 600,
    //height:270,
    modal: true,
    title: "显示详情",
    buttons: {
        "提交": function() {
            $(this).dialog("close");
            //shell_info.addData();
        },
        "取消": function() {
            $(this).dialog("close");
        }
    },
    close: function() {}
})

$('#dialog_custom_add').dialog({
    autoOpen: false,
    width: 600,
    height: 270,

    modal: true,
    title: "自定义加壳",
    buttons: {
        "提交": function() {
            shell_info.addCustom();
        },
        "取消": function() {
            $(this).dialog("close");
        }
    },
    close: function() {}
})

$('#dialog_custom_chk').dialog({
    autoOpen: false,
    width: 600,
    height: 640,
    modal: true,
    title: "自定义加壳配置",
    buttons: {
        "保存并开始加固": function() {
            shell_info.addCustomChk(Fields.customChk);
            //shell_info.addCustomChk(test.info);
        },
        "取消": function() {
            $(this).dialog("close");
        }
    },
    close: function() {}
})

/*****!event页面事件绑定********************************************/
$('#btn_show').click(function(){
    shell_info.showData();
})

$('#btn_add').click(function(){
    //shell_info.clearData('#dialog_add');
    $('#add_game_id').val(0).trigger('change')
    $('#add_apk_file').val('')
    $('#dialog_add').dialog('open');
})
$('#btn_custom_add').click(function(){
    shell_info.clearData('#dialog_add');
    $('#add_tool_file').val('')
    $('#dialog_custom_add').dialog('open');
})

$('#list').on('click','[action="mod_table"]',function(){
    var num=$('.gri_pg .current').text();
    var rowNum=$('.gri_pg .gri_datatable_rownum').val();
    var lineNum=parseInt(num-1)*parseInt(rowNum)+parseInt(this.getAttribute('row_num'));
    shell_info.modDataRender(Fields.data[lineNum]);
    //debugger;
    $('#dialog_mod').dialog('open');
})

$('#list').on('click','[action="del_table"]',function(){
    shell_info.delData(this.getAttribute('row_num'));
})


$('#add_custom_chk_contents').on('change','[name="disable_shell"]',function(){
    var group=$('#add_custom_chk_contents .form-group');
    if(this.value==1){
        group.hide();
        $('#first').show()
        $('#first2').show()
    }else{
        group.show();

    }
}).on('change','[name="enable_partial"]',function(){
    if(this.value==0){
        $('.z-tree').hide()
    }else{
        $('.z-tree').show()
    }
})


/*****初始化页面数据!init************************************/
gs.func.initTimePicker(); 
gs.func.setDefaultTime('q_from_time', 'q_to_time');
shell_info.getGameInfo();


$(document).ready(function() {
    $(".select2").select2();
    shell_info.showData();
});


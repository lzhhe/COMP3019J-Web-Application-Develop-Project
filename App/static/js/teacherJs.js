document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("resetData");
    /*
    关闭模态框
     */
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
});
$(document).ready(function () {

    $("#changeButton").hide();
    $("#startTime").hide();
    $("#gang").hide();
    $('.color').click(function () {
        $('.color').removeClass('active');
        $(this).addClass('active');
    });

    $("#addButton").click(function () {
        const now = new Date();
        $("#eventModal").show();
        $("#updateButton").hide();
        $("#deleteButton").hide();
        $("#submitButton").show();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = now.getDate();
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        let formattedDate = year + '-' + month + '-' + day;
        $("#date").val(formattedDate);
        let hours = now.getHours();
        let minutes = now.getMinutes();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        $("#endTime").val(hours + ':' + minutes);
    });

    $("#cancelButton").click(function () {
        $("#eventModal").hide();
    });

    $("#submitButton").off('click').on('click', function (e) {
        e.preventDefault();  // 阻止表单的默认提交行为

        let title = $("#eventTitle").val();
        if (title === '') {
            alert("Please type the title");
            return;  // 退出函数，不提交表单
        }
        let colorValue = 2; // 默认颜色值
        if ($(".color.active").length > 0) {
            colorValue = $(".color.active").data('color');
        }
        const formData = {
            title: title,
            date: $("#date").val(),
            endTime: $("#endTime").val(),
            content: $("#content").val(),
            color: colorValue
        };

        console.log(formData);
        $.post('/teacher/addDDL', formData, function (response) {
            if (response.code === 200) {
                location.reload();
            } else {
                alert(response.message);  // 显示错误消息
            }
        });
    });


    $(".sortable").click(function () {
        let sortBy = $(this).data('sort');
        let currentOrder = $(this).attr('data-current-order') || 'asc'; // 默认为asc
        let newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

        let currentSearch = new URL(window.location.href).searchParams.get("search") || '';
        let searchParam = currentSearch ? `&search=${currentSearch}` : '';

        window.location.href = `/teacher/teacherView?sort=${sortBy}&order=${newOrder}${searchParam}`;
    });
    $('#back').click(function () {
        window.location.href = `/teacher/teacherView`;
    });

    $('.del').click(function () {
        let that = $(this);
        let did = that.attr("data-id");
        if (window.confirm("Are you sure to delete?")) {
            $.post('/teacher/delDDL', {did: did}, function (data) {
                if (data.code === 200) {
                    location.reload();
                }
            });
        }
    });
    $('.alt').click(function () {
        let that = $(this); // 当前被点击的 "alt" 按钮的 jQuery 对象
        let did = that.data("id"); // 获取按钮的 data-id 属性值
        // 通过 closest 方法找到按钮最近的父级 <tr> 元素
        let tr = that.closest('tr');
        // 在找到的 <tr> 元素内部，使用 find 方法查找具有 data-title 属性的 <td> 元素
        let td = tr.find('td[data-title]');
        // 从找到的 <td> 元素中获取数据
        let title = td.data('title'); // 获取 data-title 属性值
        let date = td.data('date'); // 获取 data-date 属性值
        let endTime = td.data('endtime'); // 获取 data-endtime 属性值
        let color = td.data('color'); // 获取 data-color 属性值
        let content = td.data('content');

        // 显示模态框并更新字段
        $("#eventModal").show();
        $("#submitButton").hide();
        $("#updateButton").show();
        $("#deleteButton").show();

        // 填充模态框字段
        $("#sdId").val(did);
        $("#eventTitle").val(title);
        $("#date").val(date);
        $("#endTime").val(endTime);
        $("#content").val(content);

        $(".color").removeClass("active");
        $(".color[data-color='" + color + "']").addClass('active');
    });
    $("#updateButton").off('click').on('click', function (e) {
        e.preventDefault();  // 阻止表单的默认提交行为

        let title = $("#eventTitle").val();
        if (title === '') {
            alert("Please type the title");
            return;  // 退出函数，不提交表单
        }
        let colorValue = 2; // 默认颜色值
        if ($(".color.active").length > 0) {
            colorValue = $(".color.active").data('color');
        }
        const formData = {
            did: $("#sdId").val(),
            title: title,
            date: $("#date").val(),
            endTime: $("#endTime").val().substring(0,5),
            content: $("#content").val(),
            color: colorValue
        };
        console.log(formData);
        $.post('/teacher/updateDDL', formData, function (response) {
            if (response.code === 200) {
                location.reload();
            } else {
                alert(response.message);  // 显示错误消息
            }
        });
    });

});
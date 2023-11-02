document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById("resetData");
    const modal2 = document.getElementById("addData");
    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
        if (event.target === modal2) {
            modal2.style.display = "none";
        }
    };
});
$(document).ready(function () {
    $(".sortable").click(function () {
        let sortBy = $(this).data('sort');
        let currentOrder = $(this).attr('data-current-order') || 'asc'; // 默认为asc
        let newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

        let currentSearch = new URL(window.location.href).searchParams.get("search") || '';
        let searchParam = currentSearch ? `&search=${currentSearch}` : '';

        // 添加sort, order和search查询参数
        window.location.href = `/admin/adminView?sort=${sortBy}&order=${newOrder}${searchParam}`;
    });
    $('#back').click(function () {
        window.location.href = `/admin/adminView`;
    });
    $('.del').click(function () {
        let that = $(this);
        let id = that.attr("data-id");
        if (window.confirm("Are you sure to delete?")) {
            $.post('/admin/delInfor', {id: id}, function (data) {
                if (data.code === 200) {
                    location.reload();
                }
            });
        }
    });
    $('.alt').click(function () {
        let that = $(this);
        let uid = that.attr("data-id");
        $('#user_uid').val(uid);
    });
});




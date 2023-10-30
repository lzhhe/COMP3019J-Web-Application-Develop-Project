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
    $('.radio .block').click(function () {
        $(this).addClass('option').siblings().removeClass('option')
    })
    $('#back').click(function () {
        window.location.href = `/admin/adminView`;
    });
});



document.addEventListener('DOMContentLoaded', function () {
    const resetDataElement = document.getElementById('resetData');
    const userSelfElement = document.getElementById('userSelf');

    window.onclick = function (event) {
        if (event.target === resetDataElement) {
            resetDataElement.style.display = 'none';
        }
    };

    userSelfElement.addEventListener('click', function () {
        resetDataElement.style.display = 'block';
    });
});
$(document).ready(function () {
    $('.radio .block').click(function () {
        $(this).addClass('option').siblings().removeClass('option')
    })
});
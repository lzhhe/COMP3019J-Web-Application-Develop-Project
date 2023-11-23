import {isSameDate, navCalendar} from "./tempJs/calendar.js";

const calendar = new navCalendar();

function hoverOver() {
    $(this).addClass("currentTime"); // 使用 $(this) 来引用当前悬停的元素
}

function hoverOut() {
    $(this).removeClass("currentTime"); // 使用 $(this) 来引用当前悬停的元素
}

$(document).ready(function () {
    for (let i = 0; i < 42; i++) {
        // 创建外部的dayDiv
        let dayDiv = $('<div>', {
            'data-name': '',
            'data-dayIndex': i,
            'class': 'day',
        });

        // 创建内部的dates和events div
        let datesDiv = $('<div>', {
            'class': 'dates',
            'text': calendar.listDates[i].day,
        });

        let eventsDiv = $('<div>', {
            'class': 'events',
        });

        // 将dates和events div添加到dayDiv中
        dayDiv.append(datesDiv).append(eventsDiv);

        // 为dayDiv添加hover事件监听器
        dayDiv.hover(
            hoverOver,
            hoverOut
        );

        // 将dayDiv添加到月视图容器中
        $('.monthDates').append(dayDiv);
    }
});

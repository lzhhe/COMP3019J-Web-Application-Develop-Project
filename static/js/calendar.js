const dayMs = 86400000;
const weekMs = 604800000;

// 通过 getYear() 和 getMonth() 获取当前年份和月份，然后创建一个新的日期对象，表示当前月份的第一天（日期设置为1）。
export function getFirstDay (date){ // date为当前日期
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay;
}
// 获取当前年份和月份，然后创建一个新的日期对象，表示下个月份的第一天（月份+1）的前一天（日期设置为0）
export function getLastDay (date){ // date为当前日期
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay;
}
export function isLeapYear(year) { // year是当前年
    // 闰年的判定规则：年份能被4整除但不能被100整除，或者能被400整除
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getPrevMonthDays(date) { // date为当前日期
    const prevMonthDays = [];
    const currentFirstDate = getFirstDay(date); // 得到当前月份的第一天
    const currentFirstDateWeekDay = currentFirstDate.getDay(); // 星期几，0表示周日，123456为周123456
    const currentFirstDateTime = currentFirstDate.getTime();
    // 获取 currentFirstDate 对象的时间戳。基于1970.1.1，之前之后都可
    // 利用毫秒可以在不同时区显示正确的时间

    // 表示循环几次，这样就可以把前面的日期加进来了
    // 比如是周三的话，需要插入周日，周一，周二，正好三次
    for (let i = 0; i < currentFirstDateWeekDay; i++){
        const prevMonthDay = new Date(currentFirstDateTime - dayMs * (currentFirstDateWeekDay - i));
        // 这个表示往前一直推送，倒着推的
        prevMonthDays.push(prevMonthDay);
    }
    return prevMonthDays;
}
export function getNextMonthDays(date) { // date为当前日期
    const nextMonthDays = [];
    const currentLastDate = getLastDay(date); // 
    const currentLastDateWeekDay = currentLastDate.getDay(); // 星期几，0表示周日，123456为周123456
    const currentLastDateTime = currentLastDate.getTime();
    for (let i = 0; i < 6 - currentLastDateWeekDay; i++){
        const nextMonthDay = new Date(currentLastDateTime + dayMs * (1 + i));
        nextMonthDays.push(nextMonthDay);
    }
    return nextMonthDays;
}

export function getCurrentMonthDays(date) {
    const currentDays = [];
    const firstDate = getFirstDay(date);
    const lastDate = getLastDay(date);
    const lastDateNumber = lastDate.getDate();

    for (let i = 1; i <= lastDateNumber; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setDate(i);
        currentDays.push(currentDate);
    }
    return currentDays;
}
export function getDay(date) {
    const preDates = getPrevMonthDays(date);
    const nextDates = getNextMonthDays(date);
    const currentDates = getCurrentMonthDays(date);
    return preDates
        .concat(currentDates)
        .concat(nextDates);
}


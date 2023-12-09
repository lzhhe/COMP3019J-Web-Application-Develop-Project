class DateItem {
    constructor(date) {
        this.date = date;
        //day表示数字
        this.day = date.getDate(); // 得到几号
        //today是否是今天
        this.today = false;
        this.preMonth = false;
        this.nextMonth = false;
        this.currentMonth = false;
        this.isChoose = false;
    }
}

const dayMs = 86400000;
const weekMs = 604800000;
//得到今天的时间
const today = new Date();

/**
 * 通过 getYear() 和 getMonth() 获取当前年份和月份，然后创建一个新的日期对象，表示当前月份的第一天（日期设置为1）。
 * @param {*} date
 * @returns
 */
function getFirstDay(date) {
    // date为当前日期
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 获取当前年份和月份，然后创建一个新的日期对象，表示下个月份的第一天（月份+1）的前一天（日期设置为0）
 * 就是当前月的最后一天
 */
function getLastDay(date) {
    // date为当前日期
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * year是当前年
 * 闰年的判定规则：年份能被4整除但不能被100整除，或者能被400整除
 * @returns
 */
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 是否是同一天
 */
export function isSameDate(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * 是否是同一月
 */
function isSameMonth(date1, date2) {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    );
}

/**
 * 得到上一个月遗留的日期
 */
function getPrevMonthDays(date) {
    // date为当前日期
    const prevMonthDays = [];
    const currentFirstDate = getFirstDay(date); // 得到当前月份的第一天
    const currentFirstDateWeekDay = currentFirstDate.getDay(); // 本月第一天是星期几，0表示周日，123456为周123456
    const currentFirstDateTime = currentFirstDate.getTime();
    // 获取 currentFirstDate 对象的时间戳。基于1970.1.1，之前之后都可
    // 利用毫秒可以在不同时区显示正确的时间

    // 表示循环几次，这样就可以把前面的日期加进来了
    // 比如是周三的话，需要插入周日，周一，周二，正好三次
    for (let i = 0; i < currentFirstDateWeekDay; i++) {
        const prevMonthDay = new Date(
            currentFirstDateTime - dayMs * (currentFirstDateWeekDay - i)
        );
        // 这个表示往前一直推送，倒着推的
        const dateItem = new DateItem(prevMonthDay);
        dateItem.preMonth = true;
        prevMonthDays.push(dateItem);
    }
    return prevMonthDays;
}

/**
 * 得到下一个月补足的日期
 */
function getNextMonthDays(date, appendOrNot) {
    // date为当前日期
    const nextMonthDays = [];
    const currentLastDate = getLastDay(date); //
    const currentLastDateWeekDay = currentLastDate.getDay(); // 星期几，0表示周日，123456为周123456
    const currentLastDateTime = currentLastDate.getTime();
    for (let i = 0; i < (6 - currentLastDateWeekDay) + (appendOrNot ? 7 : 0); i++) {
        const nextMonthDay = new Date(currentLastDateTime + dayMs * (1 + i));
        const dateItem = new DateItem(nextMonthDay);
        dateItem.nextMonth = true;
        nextMonthDays.push(dateItem);
    }
    return nextMonthDays;
}

/**
 * 得到这一个月的所有日期
 */
//本月所有日期
function getCurrentMonthDays(date) {
    const currentDays = [];
    const firstDate = getFirstDay(date);
    const lastDate = getLastDay(date);
    const lastDateNumber = lastDate.getDate();
    for (let i = 1; i <= lastDateNumber; i++) {
        const currentDate = new Date(firstDate);
        currentDate.setDate(i);
        const dateItem = new DateItem(currentDate);
        dateItem.currentMonth = true;
        dateItem.today = isSameDate(today, currentDate);
        dateItem.select = dateItem.today;
        currentDays.push(dateItem);
    }
    return currentDays;
}

/**
 * 得到日历需要的日期。包括当前月以及前一个月剩下的和下一个月之前的
 */
export function getDates(date) {
    const preDates = getPrevMonthDays(date);
    const currentDates = getCurrentMonthDays(date);
    const length = preDates.length + currentDates.length;
    const nextDates = getNextMonthDays(date, (length <= 35));
    return preDates.concat(currentDates).concat(nextDates);
}

/**
 * 得到上一个月的某一天
 * @param date
 * @returns {Date}
 */
function getPreDate(date) {
    // 获取当年、当月、当日
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // 计算上个月的年月
    let prevY;
    let prevM;
    if (month === 0) {
        // 一月
        // 表示当前是第一个月，上一个月会是上一年的最后一个月
        prevY = year - 1;
        prevM = 11; // 12月
    } else {
        prevY = year;
        prevM = month - 1;
    }

    // 检查上个月的最后一天
    // 重大bug，月份必须加一，因为0是前一个月的最后一天，如果忘了加一，那么就相当于往前多跑一个月
    const preMonthLastDay = new Date(prevY, prevM + 1, 0).getDate();

    // 如果当天的日期大于上个月的总天数（例如5月31日，4月没有31号），则返回下个月的最后一天
    let preD = 0;
    if (day > preMonthLastDay) {
        preD = preMonthLastDay;
    } else {
        preD = day;
    }
    return new Date(prevY, prevM, preD);
}

/**
 * 得到下一个月的某一天。切换月份的时候用这个，因为如果是最后一天切换的话，每个月的最后一天的日子不一样
 * @param date
 * @returns {Date}
 */
function getNextDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth(); // 9
    const day = date.getDate();

    // 计算下个月的年月
    let nextY;
    let nextM;
    if (month === 11) {
        // 12月
        nextY = year + 1;
        nextM = 0; // 1月
    } else {
        nextY = year;
        nextM = month + 1; // 10
    }

    // 检查下个月的最后一天
    const nextMonthLastDay = new Date(nextY, nextM + 1, 0).getDate(); // 10

    // 如果当天的日期大于下个月的总天数（例如3月31日，4月没有31号），则返回下个月的最后一天
    let nextD = 0;
    if (day > nextMonthLastDay) {
        nextD = nextMonthLastDay;
    } else {
        nextD = day;
    }

    // console.log(new_date);
    return new Date(nextY, nextM, nextD);
}

/**
 * 它就是一个具体的月的实现逻辑
 */
export class navCalendar {
    constructor() {
        /*
        选中的日子，默认是当天
         */
        this.selectedDate = new Date();
        /*
        这个月的所有日子
         */
        this.listDates = []; // 所有相关的日子们
        this.initDates();
    }

    initDates() {
        this.updateDates();
    }
/*
得到当前选中日子所在月的所有信息
 */
    updateDates() {
        this.listDates = getDates(this.selectedDate);
    }
/*
月历类的下一月，切换时候用，会更新此时的listDates
 */
    nextMonth() {
        this.selectedDate = getNextDate(this.selectedDate);
        this.updateDates();
    }
/*
月历类的上一月，切换时候用，会更新此时的listDates
 */
    preMonth() {
        this.selectedDate = getPreDate(this.selectedDate);
        this.updateDates();
    }
/*
跳到今天
 */
    to_today() {
        this.to_random(new Date()); // 跳转到今天
    }
/*
跳转到随机的某天，这个在选中非本月日子的时候运行。如果不是在同一个月就更新listDates
 */
    to_random(date) {
        const isDifferentMonth = !isSameMonth(this.selectedDate, date);
        this.selectedDate = date;
        if (isDifferentMonth) {
            this.updateDates();
        }
        // 如果是同一个月，则不需要再调用 updateDates() 函数
    }
}
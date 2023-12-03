// const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// const DAY_MS = 86400000;
// const WEEK_MS = 7 * DAY_MS;
// const DAY_MINUTE = 24 * 60;
//
// class WeekItem {
//     constructor(date) {
//         this.date = date;
//         this.day = date.getDate();
//         this.weekNum = date.getDay();
//         this.weekText = WEEK[this.weekNum];
//         this.isToday = WeekItem.isSameDate(new Date(), date);
//         this.isWeekend = this.weekNum === 0 || this.weekNum === 6;
//     }
//
//     static isSameDate(date1, date2) {
//         return date1.toDateString() === date2.toDateString();
//     }
// }
//
// export class TimeLine {
//     constructor(date, width, height) {
//         this.top = height * 24 * ((date.getHours() * 60 + date.getMinutes()) / DAY_MINUTE);
//         this.left = date.getDay() * width;
//     }
// }
//
// class WeekCalendar {
//     constructor() {
//         this.selectedDate = new Date();
//         this.selectedDate.setHours(0, 0, 0, 0);
//         this.weekList = [];
//         this.initWeek();
//     }
//     initWeek(){
//         this.updateWeek(this.selectedDate);
//     }
//
//     updateWeek(date) {
//         const startOfWeek = this.startOfWeek(date);
//         this.weekList = Array.from({ length: 7 }, (_, i) => {
//             const currentDate = new Date(startOfWeek.getTime() + i * DAY_MS);
//             return new WeekItem(currentDate);
//         });
//     }
//
//     moveWeekBy(days) {
//         this.selectedDate.setDate(this.selectedDate.getDate() + days);
//         this.updateWeek(this.selectedDate);
//     }
//
//     toPreviousWeek() {
//         this.moveWeekBy(-7);
//     }
//
//     toNextWeek() {
//         this.moveWeekBy(7);
//     }
//
//     toCurrentWeek() {
//         this.selectedDate = new Date();
//         this.selectedDate.setHours(0, 0, 0, 0);
//         this.updateWeek(this.selectedDate);
//     }
//
//     setDate(date) {
//         if (!this.inOneWeek(date, this.selectedDate)) {
//             this.updateWeek(date);
//         }
//         this.selectedDate = date;
//         this.selectedDate.setHours(0, 0, 0, 0);
//     }
//
//
//     startOfWeek(date) {
//         const start = new Date(date);
//         start.setDate(date.getDate() - date.getDay());
//         start.setHours(0, 0, 0, 0);
//         return start;
//     }
//
//     inOneWeek(date1, date2) {
//         return this.startOfWeek(date1).getTime() === this.startOfWeek(date2).getTime();
//     }
// }
// const weekView = new WeekCalendar();
// export default weekView;
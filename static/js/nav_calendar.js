import { DateItem } from "./calendar.js"; 
import { getDates, getPreDate, getNextDate, isSameMonth } from "./calendar.js";

class navCalendar {
    constructor() {
        this.selectedDate = new Date();
        this.listDates = [];
    }

    initDates(){
        this.updateDates();
    }
    updateDates(){
        this.listDates = getDates(this.selectedDate);
    }

    nextMonth(){
        this.selectedDate = getNextDate(this.selectedDate);
        this.updateDates();
    }
    preMonth(){
        this.selectedDate = getPreDate(this.selectedDate);
        this.updateDates();
    }
    to_today(){
        this.to_random(new Date());
    }
    to_random(date){
        if (isSameMonth(this.selectedDate.value, date)){
            this.selectedDate = date;
            this.updateDates();
        }
        this.selectedDate = date;

    }

}

export { navCalendar };


Date.prototype.nextHalfHour = function (interval = 0) {
    let currentDate = new Date();
    let compDate = new Date(currentDate.getTime());
    compDate.setMinutes(this.getMinutes());
    
    let returnDate = compDate > currentDate ? new Date(compDate.getTime()) : new Date(compDate.getTime() + (30 * 60000))
    returnDate.setSeconds(0);
    returnDate.setMilliseconds(0);
    returnDate = returnDate < currentDate ? new Date(returnDate.getTime() + (30 * 60000)) : returnDate;
    returnDate = returnDate < this ? this : returnDate;
    let d = new Date(returnDate.getTime() + (((30 * interval) * 60000)));
    return d;
}

class GamePlan{
    constructor(lunchDurationLimit, tasksLimit){
        this.availableColorSchemes = ['dark', 'light']
        this.booleanStrings = ['true', 'false']
        this.lunchDurationLimit = lunchDurationLimit || 0;
        this.tasksLimit = tasksLimit || 0;
    }

    get startTime() { return localStorage.getItem('startTime') || '00:00' }
    get startTimeAsDate() { return this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]) }
    set startTime(newStartTime) { 
        if(!(this.hourLimits(newStartTime.split(':')[0]) && this.minuteLimits(newStartTime.split(':')[1]))){ return }
        localStorage.setItem('startTime', newStartTime) 
    }
    get endTime() { return localStorage.getItem('endTime') || '00:00' }
    get endTimeAsDate() { return this.setDate(this.endTime.split(':')[0], this.endTime.split(':')[1]) }
    set endTime(newEndTime) { 
        if(!(this.hourLimits(newEndTime.split(':')[0]) && this.minuteLimits(newEndTime.split(':')[1]))){ return }
        localStorage.setItem('endTime', newEndTime) 
    }
    get lunchTime() { return localStorage.getItem('lunchTime') || '00:00' }
    get lunchTimeAsDate() { return this.setDate(this.lunchTime.split(':')[0], this.lunchTime.split(':')[1]) }
    set lunchTime(newLunchTime) { 
        if(!(this.hourLimits(newLunchTime.split(':')[0]) && this.minuteLimits(newLunchTime.split(':')[1]))){ return }
        localStorage.setItem('lunchTime', newLunchTime) 
    }
    get lunchDuration() { return localStorage.getItem('lunchDuration') || 0 }
    set lunchDuration(newLunchDuration) { 
        if(this.lunchDurationLimit > 0 && newLunchDuration >= this.lunchDurationLimit) { return }
        localStorage.setItem('lunchDuration', newLunchDuration) 
    }
    get goalTime() { return localStorage.getItem('goalTime') || '00:00' }
    set goalTime(newGoalTime) { 
        if(!(this.hourLimits(newGoalTime.split(':')[0]) && this.minuteLimits(newGoalTime.split(':')[1]))){ return }
        localStorage.setItem('goalTime', newGoalTime) 
    }
    get goalTasks() { return localStorage.getItem('goalTasks') || 0 }
    set goalTasks(newGoalTasks) { 
        if(this.tasksLimit > 0 && newGoalTasks >= this.tasksLimit) { return }
        localStorage.setItem('goalTasks', newGoalTasks) 
    }
    get colorScheme() { return localStorage.getItem('colorScheme') || (window.matchMedia("(prefers-color-scheme:light)").matches ? 'light' : 'dark') }
    set colorScheme(newColorScheme) { 
        if(!this.availableColorSchemes.includes(newColorScheme)){ return }
        localStorage.setItem('colorScheme', newColorScheme);
    }
    get milestone() { return localStorage.getItem('milestone') || 'true' }
    set milestone(newMilestone) { 
        if(!this.booleanStrings.includes(newMilestone)){ return }
        localStorage.setItem('milestone', newMilestone) 
    }
    get perHour() { return localStorage.getItem('perHour') || 'true' }
    set perHour(newPerHour) { 
        if(!this.booleanStrings.includes(newMilestone)){ return }
        localStorage.setItem('perHour', newPerHour) 
    }
    get morningStart() { return this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]) }
    get morningEnd() { return this.setDate(this.lunchTime.split(':')[0], this.lunchTime.split(':')[1]) }
    get afternoonStart() { return this.setDate(this.lunchTime.split(':')[0], parseInt(this.lunchTime.split(':')[1]) + parseInt(this.lunchDuration)) }
    get afternoonEnd() { return this.setDate(this.endTime.split(':')[0], this.endTime.split(':')[1]) }
    get tpt() { return Math.round((((Math.abs(this.morningEnd - this.morningStart) + Math.abs(this.afternoonEnd - this.afternoonStart)) / 1000) / this.goalTasks) * 100) / 100 }
    get tpgt() { return ((Math.abs(this.morningEnd - this.morningStart) + Math.abs(this.afternoonEnd - this.afternoonStart)) / 1000) / Math.round((((this.goalTime.split(':')[0] * 3600) + (this.goalTime.split(':')[1] * 60)) * 100) / 100) }
    get tasksPerHour() { return Math.round(60 / (Math.round((((Math.abs(this.morningEnd - this.morningStart) + Math.abs(this.afternoonEnd - this.afternoonStart)) / 1000) / this.goalTasks) * 100) / 100) * 60 * 100) / 100 }
    get minutesPerHour() { return 60 / (Math.round(((Math.abs(this.morningEnd - this.morningStart) + Math.abs(this.afternoonEnd - this.afternoonStart)) / 1000) / ((this.goalTime.split(':')[0] * 3600) + (this.goalTime.split(':')[1] * 60)) * 100) / 100) }

    elapsedPercentage(setTime){
        let elapsedMorningPercent = 0;
        let elapsedAfternoonPercent = 0;
        if(setTime >= this.morningStart && setTime <= this.morningEnd){
            elapsedMorningPercent = Math.abs(setTime - this.morningStart) / Math.abs(this.morningEnd - this.morningStart);   
        }
        if(setTime >= this.afternoonStart && setTime <= this.afternoonEnd){
            elapsedAfternoonPercent = Math.abs(setTime - this.afternoonStart) / Math.abs(this.afternoonEnd - this.afternoonStart);
        }
        if(setTime >= this.morningEnd){
            elapsedMorningPercent = 1;
        }
        if(setTime >= this.afternoonEnd){
            elapsedAfternoonPercent = 1;
        }
        return {
            'elapsedMorningPercent': elapsedMorningPercent,
            'elapsedAfternoonPercent' : elapsedAfternoonPercent
        }
    }

    currentLevels(type = ['time', 'task', 'milestone'], setTime){
        if(setTime){setTime.setSeconds(0); setTime.setMilliseconds(0)}
        let returnObj = {};
        let currentDate = setTime || new Date();
        let morningPercent = (Math.abs(this.morningEnd - this.morningStart) / (Math.abs(this.morningEnd - this.morningStart) + Math.abs(this.afternoonEnd - this.afternoonStart)));
        let afternoonPercent = (Math.abs(this.afternoonEnd - this.afternoonStart) / (Math.abs(this.afternoonEnd - this.afternoonStart) + Math.abs(this.morningEnd - this.morningStart)));
        if(type.includes('time')){
            let morningGoalTime = ((this.goalTime.split(':')[0] * 3600) + (this.goalTime.split(':')[1] * 60)) * morningPercent;
            let afternoonGoalTime = ((this.goalTime.split(':')[0] * 3600) + (this.goalTime.split(':')[1] * 60)) * afternoonPercent;
            let currentTime = this.elapsedPercentage(currentDate);
            returnObj.time = {};
            returnObj.time.text = Math.floor(((morningGoalTime * currentTime.elapsedMorningPercent) + (afternoonGoalTime * currentTime.elapsedAfternoonPercent)) / 3600) + 'h ' + Math.floor((((morningGoalTime * currentTime.elapsedMorningPercent) + (afternoonGoalTime * currentTime.elapsedAfternoonPercent)) % 3600) / 60 ) + 'm';
            returnObj.time.value = Math.floor((morningGoalTime * currentTime.elapsedMorningPercent) + (afternoonGoalTime * currentTime.elapsedAfternoonPercent));
        }
        if(type.includes('task')){
            let morningGoalTasks = this.goalTasks * morningPercent;
            let afternoonGoalTasks = this.goalTasks * afternoonPercent;
            let currentTask = this.elapsedPercentage(currentDate);
            returnObj.task = {};
            returnObj.task.text = Math.floor((morningGoalTasks * currentTask.elapsedMorningPercent) + (afternoonGoalTasks * currentTask.elapsedAfternoonPercent)) + 'tasks';
            returnObj.task.value = Math.floor((morningGoalTasks * currentTask.elapsedMorningPercent) + (afternoonGoalTasks * currentTask.elapsedAfternoonPercent));
        }
        if(type.includes('milestone')){
            returnObj.milestone = {};
            returnObj.milestone.text = this.milestones();
        }
        return returnObj;
    }

    milestones(){
        let retArray = [];
        for(let n = 0; n < 4; n++){
            let startTime = this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]);
            let tasks = this.currentLevels('task', startTime.nextHalfHour(n));
            let time = this.currentLevels('time', startTime.nextHalfHour(n));
            if(startTime.nextHalfHour(n) <= this.setDate(this.endTime.split(':')[0], this.endTime.split(':')[1])){
                retArray.push(this.leadingZero(startTime.nextHalfHour(n).getHours()) + ':' + this.leadingZero(startTime.nextHalfHour(n).getMinutes()) + ': ' + time.time.text + ' ' + tasks.task.text);
            }
        }
        return retArray;
    }

    leadingZero(value){
        value = parseInt(value);
        return value < 10 ? '0' + value : value;
    }

    setDate(hour, minute){
        let d = new Date();
        d.setHours(parseInt(hour));
        d.setMinutes(parseInt(minute));
        d.setSeconds(0);
        d.setMilliseconds(0);

        return d;
    }

    hourLimits(value){
        if(parseInt(value) >= 0 && parseInt(value) < 24){ 
            return true;
        }
        return false;
    }

    minuteLimits(value){
        if(parseInt(value) >= 0 && parseInt(value) < 59){ 
            return true;
        }
        return false;
    }

    #getIntervals(task){
        let levels = this.currentLevels();
        let nextUpdate;
        let lunchHour = new Date() > new Date(new Date(this.setDate(this.lunchTime.split(':')[0], this.lunchTime.split(':')[1]).setTime() + (this.lunchDuration * 60000))) ? parseInt(this.lunchDuration) : 0;
        if(task === 'task'){
            nextUpdate = (lunchHour * 60000) + (this.tpt * 1000) + ((levels.task.value * this.tpt) * 1000) + this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]).getTime();
        }
        if(task === 'time'){
            nextUpdate = (lunchHour * 60000) + (this.tpgt * 60000) + ((parseInt(levels.time.value / 60) * this.tpgt) * 60000) + (this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]).getTime());
        }
        if(task === 'milestone'){
            nextUpdate = this.setDate(this.startTime.split(':')[0], this.startTime.split(':')[1]).nextHalfHour().getTime();
        }
        return Math.abs(nextUpdate - new Date().getTime());
    }

    updateTime(type = ['time', 'task', 'milestone']){
        let cl = this.currentLevels();
        type.forEach(el=>{
            window.dispatchEvent(new CustomEvent(`gp-update-${el}`, {detail: cl[el]}));
            setTimeout(this.updateTime.bind(this, [el]), this.#getIntervals(el));
        });
    };
}
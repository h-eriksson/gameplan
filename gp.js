((function(){

    'use strict'
    
    let tooltipTimeOut;
    let counterTimeOut;
    let settings = {};
    let dates = {};

    function updateSettings(){
        settings.startTime = localStorage.getItem('startTime') || '00:00';
        settings.endTime = localStorage.getItem('endTime') || '00:00';
        settings.goalTime = localStorage.getItem('goalTime') || '00:00';
        settings.goalTasks = localStorage.getItem('goalTasks') || 0;
        settings.darkMode = localStorage.getItem('darkMode') || (window.matchMedia("(prefers-color-scheme:light)").matches ? 'light' : 'dark');
        settings.lunchTime = localStorage.getItem('lunchTime') || '00:00';
        settings.lunchDuration = localStorage.getItem('lunchDuration') || 0;
        settings.milestone = localStorage.getItem('milestone') || true;
        settings.milestoneFrequency = localStorage.getItem('milestoneFrequency') || 30;

        dates.morningStart = setDate(settings.startTime.split(':')[0], settings.startTime.split(':')[1]);
        dates.morningEnd = setDate(settings.lunchTime.split(':')[0], settings.lunchTime.split(':')[1]);
        dates.afternoonStart = setDate(settings.lunchTime.split(':')[0], parseInt(settings.lunchTime.split(':')[1]) + parseInt(settings.lunchDuration));
        dates.afternoonEnd = setDate(settings.endTime.split(':')[0], settings.endTime.split(':')[1]);

        settings.morningPercent = Math.abs(dates.morningEnd - dates.morningStart) / (Math.abs(dates.afternoonEnd - dates.afternoonStart) + Math.abs(dates.morningEnd - dates.morningStart));
        settings.afternoonPercent = Math.abs(dates.afternoonEnd - dates.afternoonStart) / (Math.abs(dates.afternoonEnd - dates.afternoonStart) + Math.abs(dates.morningEnd - dates.morningStart));
        settings.morningGoalTasks = settings.goalTasks * settings.morningPercent;
        settings.afternoonGoalTasks = settings.goalTasks * settings.afternoonPercent;
        settings.morningGoalTime = ((settings.goalTime.split(':')[0] * 3600) + (settings.goalTime.split(':')[1] * 60)) * settings.morningPercent;
        settings.afternoonGoalTime = ((settings.goalTime.split(':')[0] * 3600) + (settings.goalTime.split(':')[1] * 60)) * settings.afternoonPercent;
        settings.currentTime = (setTime)=>{
            if(setTime){setTime.setSeconds(0); setTime.setMilliseconds(1000)}
            let d = setTime || new Date();
            let mPercent = 0;
            let aPercent = 0;
            if(d > dates.morningStart && d < dates.morningEnd){
                mPercent = Math.abs(dates.morningStart - d) / Math.abs(dates.morningEnd - dates.morningStart);
            }else{
                mPercent = 1;
            }
            if(d > dates.afternoonStart && d < dates.afternoonEnd){
                aPercent = Math.abs(dates.afternoonStart - d) / Math.abs(dates.afternoonEnd - dates.afternoonStart);
            }
            let mh = settings.morningGoalTime * mPercent;
            let ah = settings.afternoonGoalTime * aPercent;
            return Math.floor((mh + ah) / 3600) + 'h ' + Math.floor(((mh + ah) % 3600) / 60) + 'm';
        }
        settings.currentTasks = (setTime)=>{
            if(setTime){setTime.setSeconds(0); setTime.setMilliseconds(1000)}
            let d = setTime || new Date();
            let mPercent = 0;
            let aPercent = 0;
            if(d > dates.morningStart && d < dates.morningEnd){
                mPercent = Math.abs(dates.morningStart - d) / Math.abs(dates.morningEnd - dates.morningStart);
            }else{
                mPercent = 1;
            }
            if(d > dates.afternoonStart && d < dates.afternoonEnd){
                aPercent = Math.abs(dates.afternoonStart - d) / Math.abs(dates.afternoonEnd - dates.afternoonStart);
            }
            let mt = settings.morningGoalTasks * mPercent;
            let at = settings.afternoonGoalTasks * aPercent;
            return Math.floor(mt + at) + 'tasks';
        }
    }

    function setDate(hour, minute){
        let d = new Date();
        d.setHours(parseInt(hour));
        d.setMinutes(parseInt(minute));
        d.setSeconds(0);

        return d;
    }

    updateSettings();

    function setDarkMode(){
        document.getElementsByTagName('body')[0].dataset.colorscheme = document.getElementsByTagName('body')[0].dataset.colorscheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('darkMode', document.getElementsByTagName('body')[0].dataset.colorscheme);
    }

    document.getElementById('darkModeCheck').addEventListener('change', ev=>{
        setDarkMode();
    })

    //Getting and setting up darkMode.
    document.getElementsByTagName('body')[0].dataset.colorscheme = settings.darkMode; //Setting darkMode according to localStorage
    let darkModeIcon = document.querySelector('.icon-darkMode');
    ['click', 'keydown'].forEach(el=>{
        darkModeIcon.addEventListener(el, ev=>{
            if(!['Shift', 'Tab'].includes(ev.key)){
                setDarkMode();
                document.getElementById('darkModeCheck').checked = localStorage.getItem('darkMode') === 'light' ? false : true;
            }
        });
    })

    let body = document.getElementsByTagName('body')[0];
    ['click', 'keydown'].forEach(el=>{
        body.addEventListener('click', ev=>{
            document.getElementById('settingsMenu').style.display = 'none';
        });
    });

    document.getElementById('settingsMenu').addEventListener('click', ev=>{
        ev.stopPropagation();
    })

    let settingsIcon = document.querySelector('.icon-settings');
    ['click', 'keydown'].forEach(el=>{
        settingsIcon.addEventListener(el, ev=>{
            if(!['Shift', 'Tab'].includes(ev.key)){
                ev.stopPropagation();   
                document.getElementById('settingsMenu').style.display = document.getElementById('settingsMenu').style.display === 'block' ? 'none' : 'block';
                Array.from(document.getElementsByClassName('tooltip')).forEach(tt=>{
                    tt.style.display = 'none';
                });
            }
        })
    });

    document.getElementById('milestoneCheck').addEventListener('change', ev=>{
        document.getElementById('sidePanel').style.display = document.getElementById('sidePanel').style.display === 'block' ? 'none' : 'block';
    });

    document.getElementById('milestoneCheck').checked = settings.milestone;
    document.getElementById('milestoneCheck').dispatchEvent(new Event('change'));

    //Updates all calculation if the inputs are changed.
    let inputs = document.querySelectorAll('input[type="time"], input[type="number"]');
    inputs.forEach(el=>{ //iterating all the inputs
        el.value = settings[el.name]; //Setting all inputs to the stored value or "0"
        el.addEventListener('change', ev=>{
            localStorage.setItem(el.name, el.value);
            updateSettings();
            updateCounter();
        })
    });

    //Making the tooltip appear if icons are hovered, and disappear if not hovered.
    let icons = document.querySelectorAll('.icon');
    icons.forEach(el=>{
        el.addEventListener('mouseover',ev=>{
            if(document.getElementById('settingsMenu').style.display !== 'block'){
                tooltipTimeOut = setTimeout(()=>{
                    el.parentElement.lastElementChild.style.display = 'block';
                }, 500);
            }
        });
        el.addEventListener('mouseout', ev=>{
            ev.stopPropagation();
            clearTimeout(tooltipTimeOut);
            el.parentElement.lastElementChild.style.display = 'none';
        })
    })

    //helper-function. Finds the closest greater number evenly divisible by m.
    function closestNumber(n, m)
    {
        return (n * m) > 0 ? 
            (m * (parseInt(n / m) + 1)) : 
            (m * (parseInt(n / m) - 1));
    }

    //Starts the interval at an evenly divisible by 5 second time.
    setTimeout(()=>{
        counterTimeOut = setInterval(updateCounter, 2500);
    }, Math.abs(new Date(new Date(new Date().getTime()).setSeconds(closestNumber(new Date(new Date().getTime()).getSeconds(), 5))) - new Date()));

    //Updates the output.
    function updateCounter(){
        let currentTimeStamp = new Date();
        if(currentTimeStamp > dates.morningStart && currentTimeStamp < dates.afternoonEnd){
            document.getElementById('counter').innerHTML = `${settings.currentTime()}<br>${settings.currentTasks()}`;
            if(currentTimeStamp >= dates.morningEnd && currentTimeStamp <= dates.afternoonStart){
                document.getElementById('lunch').style.display = 'block';
            }else{
                document.getElementById('lunch').style.display = 'none';
            }
            updateMilestone();
        }
    }

    function updateMilestone(){
        let d = new Date();
        let minutesTo = closestNumber(d.getMinutes(), 30) === 30 ? 30 - d.getMinutes() : 60 - d.getMinutes();
        let milestones = Array.from(document.getElementsByClassName('milestone'));
        for(let t = 0; t <= 3; t++){
            let nextT = new Date().setMinutes(new Date().getMinutes() + minutesTo + (30 * t));
            let nextD = settings.currentTime(new Date(new Date().setMinutes(new Date().getMinutes() + minutesTo + (30 * t))));
            let nextTask = settings.currentTasks(new Date(new Date().setMinutes(new Date().getMinutes() + minutesTo + (30 * t))));
            milestones[t].innerHTML = new Date(nextT).getHours() + ':' + leadingZero(new Date(nextT).getMinutes()) + ' : ' + nextD + ' ' + nextTask;
        }
    }

    updateCounter();

    function leadingZero(n){
        return parseInt(n) > 10 ? n : '0' + n;
    }

    //getting the last time this js file was saved.
    fetch("./gp.js")
    .then(response => response.blob())
    .then(blob => {
        const file = new File([blob], blob.name);
        document.getElementById('updated').innerHTML = ' ' + new Date(file.lastModified);
    });

}()));
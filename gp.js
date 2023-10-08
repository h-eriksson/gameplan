((function(){

    'use strict'
    
    let tooltipTimeOut;
    let gp = new GamePlan();

    gp.milestone = true;

    if(localStorage.getItem('darkMode') === null){
        localStorage.setItem('darkMode', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    let inputs = ['startTime', 'endTime', 'lunchTime', 'lunchDuration', 'goalTime', 'goalTasks'];

    inputs.forEach(el=>{
        let element = document.getElementById(el);
        element.value = gp[el];
        element.addEventListener('change', ev=>{
            gp[el] = element.value;
            init();
        });
    });

    function init(){
        document.getElementById('time').innerHTML = gp.currentLevels(['time']).time.text;
        document.getElementById('tasks').innerHTML = gp.currentLevels(['task']).task.text;
        document.getElementById('goalTasksPerHour').innerHTML = `${Math.round(gp.tasksPerHour * 100) / 100}tasks/h`;
        document.getElementById('goalTimePerHour').innerHTML = `${Math.round(gp.minutesPerHour * 100) / 100}m/h`;
        let ms = gp.milestones();
        Array.from(document.getElementById('sidePanel').children).forEach((el, i)=>{
            if(i !== 0){
                el.innerHTML = ms[i - 1] || '';
            }
        })
        gp.updateTime();
    }

    window.addEventListener('gp-update-task', ev=>{
        document.getElementById('tasks').innerHTML = ev.detail.text;
        if(gp.lunchTimeAsDate <= new Date() && new Date(gp.lunchTimeAsDate.getTime() + (gp.lunchDuration * 60000)) >= new Date()){
            document.getElementById('lunch').style.display = 'block';
        }else{
            document.getElementById('lunch').style.display = 'none';
        }
    });

    window.addEventListener('gp-update-time', ev=>{
        document.getElementById('time').innerHTML = ev.detail.text;
    });

    window.addEventListener('gp-update-milestone', ev=>{
        let ms = gp.milestones();
        ms.forEach((el, i)=>{
            document.getElementById('sidePanel').children[i + 1].innerHTML = el;
        });
    });

    function setDarkMode(){
        document.getElementsByTagName('body')[0].dataset.colorscheme = document.getElementsByTagName('body')[0].dataset.colorscheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('darkMode', document.getElementsByTagName('body')[0].dataset.colorscheme);
    }

    document.getElementById('darkModeCheck').addEventListener('change', ev=>{
        setDarkMode();
    })

    //Getting and setting up darkMode.
    document.getElementById('darkModeCheck').checked = localStorage.getItem('darkMode') === 'light' ? false : true;
    document.getElementsByTagName('body')[0].dataset.colorscheme = localStorage.getItem('darkMode'); //Setting darkMode according to localStorage
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
        localStorage.setItem('milestone', ev.target.checked === true ? 'true' : 'false');
        document.getElementById('sidePanel').style.display = localStorage.getItem('milestone') === 'false' ? 'none' : 'block';
    });

    document.getElementById('milestoneCheck').checked = localStorage.getItem('milestone') === 'true' ? true : false;
    document.getElementById('milestoneCheck').dispatchEvent(new Event('change'));

    document.getElementById('perHourCheck').addEventListener('change', ev=>{
        localStorage.setItem('perHourCheck', ev.target.checked === true ? 'true' : 'false');
        Array.from(document.getElementsByClassName('perHour')).forEach(el=>{
            el.style.display = localStorage.getItem('perHourCheck') === 'false' ? 'none' : 'block';
        });
    });

    document.getElementById('perHourCheck').checked = localStorage.getItem('perHourCheck') === 'true' ? true : false;
    document.getElementById('perHourCheck').dispatchEvent(new Event('change'));

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

    document.getElementById('updated').innerHTML = ' ' + document.lastModified;

    init();

}()));
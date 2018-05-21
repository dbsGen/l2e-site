(function () {
    function TimerObject(elem) {
        this.elem = elem;
        this.days = elem.getElementsByClassName('day');
        this.hours = elem.getElementsByClassName('hours');
        this.minutes = elem.getElementsByClassName('minute');
        this.seconds = elem.getElementsByClassName('second');


        this.daysElem = [
            this.days[0].getElementsByClassName('number')[0],
            this.days[1].getElementsByClassName('number')[0]
        ];
        this.hoursElem = [
            this.hours[0].getElementsByClassName('number')[0],
            this.hours[1].getElementsByClassName('number')[0]
        ];
        this.minutesElem = [
            this.minutes[0].getElementsByClassName('number')[0],
            this.minutes[1].getElementsByClassName('number')[0]
        ];
        this.secondsElem = [
            this.seconds[0].getElementsByClassName('number')[0],
            this.seconds[1].getElementsByClassName('number')[0]
        ];

        if (elem.hasAttribute('data-from')) {
            this.date = new Date(elem.getAttribute('data-from'));
        }else {
            this.date = new Date();
        }

        this.number = this.getTimeNumber();
        this.setTime(this.number);

        var self = this;
        var updateFunc = function () {
            self.updateTime(self.getTimeNumber());
        };
        this.timer = setInterval(updateFunc, 1000);
    }
    TimerObject.INV_MINUTE = 60;
    TimerObject.INV_HOURS = 3600;
    TimerObject.INV_DAY = 24 * 3600;

    TimerObject.prototype.setTime = function(time) {
        this.daysElem[0].innerText = time.days[0];
        this.daysElem[1].innerText = time.days[1];
        this.hoursElem[0].innerText = time.hours[0];
        this.hoursElem[1].innerText = time.hours[1];
        this.minutesElem[0].innerText = time.minutes[0];
        this.minutesElem[1].innerText = time.minutes[1];
        this.secondsElem[0].innerText = time.seconds[0];
        this.secondsElem[1].innerText = time.seconds[1];
    };
    TimerObject.prototype.updateTime = function(number) {
        function doElem(newN, odlN, elem, idx) {
            odlN[idx] = newN[idx];
            var div = document.createElement('div');
            div.setAttribute('class', 'number enter');
            div.innerText = ''+newN[idx];
            var old = elem[idx], parent = old.parentElement;
            old.classList.remove('enter');
            old.classList.add('exit');
            elem[idx] = div;
            parent.appendChild(div);
            setTimeout(function () {
                if (parent)
                    parent.removeChild(old);
            }, 400);
        }
        if (number.seconds[0] !== this.number.seconds[0]) {
            doElem(number.seconds, this.number.seconds, this.secondsElem, 0);
        }
        if (number.seconds[1] !== this.number.seconds[1]) {
            doElem(number.seconds, this.number.seconds, this.secondsElem, 1);
        }
    };

    TimerObject.prototype.getTimeNumber = function() {
        var t = new Date();
        var time = parseInt((t.getTime() - this.date.getTime())/1000);
        var sec = time % TimerObject.INV_MINUTE;
        var min = parseInt(time / TimerObject.INV_MINUTE) % 60;
        var hor = parseInt(time / TimerObject.INV_HOURS) % 24;
        var day = parseInt(time / TimerObject.INV_DAY) % 100;

        return {
            days: [parseInt(day/10), day%10],
            hours: [parseInt(hor/10), hor%10],
            minutes: [parseInt(min/10), min%10],
            seconds: [parseInt(sec/10), sec%10]
        };
    };

    window.CountdownTimer = {
        init: function () {
            var timers = document.getElementsByClassName('timer');

            for (var i = 0, t = timers.length; i < t; ++i) {
                var timer = timers[i];
                var to = new TimerObject(timer);

            }
        }
    };
})();
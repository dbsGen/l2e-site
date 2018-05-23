function Alert(elem) {
    this.elem = elem;
    this.inner = elem.getElementsByClassName('alert')[0];
    this.close = elem.getElementsByClassName('close')[0];
    var self = this;
    this.close.onclick = function () {
        self.miss();
    };
}

Alert.prototype.setContent = function(div) {
    this.inner.innerHTML = '';
    this.inner.appendChild(div);
};

Alert.prototype.show = function() {
    this.elem.classList.remove('exit');
    this.elem.classList.add('enter');
};
Alert.prototype.miss = function() {
    this.elem.classList.add('exit');
    this.elem.classList.remove('enter');
    var self = this;
    setTimeout(function () {
        self.elem.classList.remove('exit');
    }, 400);
};

Alert.prototype.setHeight = function(height) {
    this.inner.style.height = height + 'px';
    this.inner.style.marginTop = '-' + height/2 + 'px';
};

module.exports = Alert;
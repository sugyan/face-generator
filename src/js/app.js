class Main {
    constructor(canvas) {
        canvas.height = 96;
        canvas.width  = 96;
        this.ctx = canvas.getContext('2d');
    }
    run() {
        window.console.log(this.ctx);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Main(document.getElementById('canvas')).run();
});

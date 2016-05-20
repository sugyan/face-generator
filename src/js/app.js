/* global $ */
class Main {
    constructor(canvas) {
        canvas.height = 96;
        canvas.width  = 96;
        this.ctx = canvas.getContext('2d');
    }
    generate() {
        $.ajax({
            url: '/api/generate',
            method: 'POST',
            success: (data) => {
                const img = new window.Image();
                img.onload = () => {
                    this.ctx.drawImage(img, 0, 0);
                };
                img.src = data.results[0];
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const main = new Main(document.getElementById('canvas'));
    document.getElementById('button').addEventListener('click', () => {
        main.generate();
    });
});

const chara = document.querySelector('.character');
const grid = document.querySelector('.grid');
const alert = document.getElementById('alert');
let position = 0;
let gravity = 0.9;
let isJumping = false;
let isGameOver = false;

//controls handler
function control(event) {
    //ensure player cant jump if game is over
    if (!isGameOver) {
        if (event.code === 'Space' || event.key === ' ') {
            if (!isJumping) {
                jump();
            }
        }
    }
}

document.addEventListener('keydown', control);

//main functionality
function jump() {
    isJumping = true;
    let jumpCount = 0;
    let timer = setInterval(function () {
        //move down
        if (jumpCount === 15) {
            clearInterval(timer);
            let downTimer = setInterval(function () {
                if (jumpCount === 0) {
                    clearInterval(downTimer);
                    isJumping = false;
                }
                position -= 5; 
                jumpCount--;
                position *= gravity;
                chara.style.bottom = position + 'px';
            }, 20)
        }
        //move up (on the Y axis, so +=)
        position += 30;
        jumpCount++;
        //add the effect of gravity to slow the movement down
        position *= gravity;
        chara.style.bottom = position + 'px';
    }, 20)
}

//obstacle generation + game over state
function obstacles() {

    if (!isGameOver) {
        let randomTime = Math.random() * 4000;
        let spikePos = 480;
        const spike = document.createElement('div');
        spike.classList.add('spike');
        grid.appendChild(spike);
        spike.style.left = spikePos + 'px';

        let timer = setInterval(function () {
            if (spikePos > 5 && spikePos < 60 && position < 60) {
                clearInterval(timer);
                alert.innerHTML = '!GAME OVER!';
                isGameOver = true;
                //remove all children from grid, while grid has children, remove last child
                while (grid.firstChild) {
                    grid.removeChild(grid.last);
                }
            }
            spikePos -= 10;
            spike.style.left = spikePos + 'px';
            if (spikePos < -40) {
                spike.style.border = 'none';
            }
        }, 20)

        setTimeout(obstacles, 4000);
    }

}

obstacles();
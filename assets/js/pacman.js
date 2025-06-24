const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreElement = document.querySelector('#scoreElement')
document.getElementById('levelSelect').addEventListener('change', (e) => {
    currentLevel = e.target.value;
    resetGame();
        document.querySelector('canvas').focus();

});


let currentLevel = 'Easy';

const levelModes = {
    Easy:    { pelletScore: 10, ghostCount: 1, ghostSpeed: 2, ghostScore: 100 },
    Medium:  { pelletScore: 20, ghostCount: 2, ghostSpeed: 4, ghostScore: 200 },
    Hard:    { pelletScore: 30, ghostCount: 5, ghostSpeed: 5, ghostScore: 300 },
    Insane:  { pelletScore: 50, ghostCount: 8, ghostSpeed: 5, ghostScore: 500 }
};

class Boundary {
    static width = 40
    static height = 40
    constructor ({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }
    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(
            this.image, 
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
    }
}

class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'red' }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false // New property to track scared state
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }

}

class Pacman {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12 // Controls how fast Pacman opens and closes
        this.defaultOpenRate = 0.12 // Default opening rate
        this.rotation = 0 // Initial rotation angle
    }
    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation) // Rotate Pacman to face the direction of movement
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius,this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = '#FFBE0B'
        c.fill()
        c.closePath()
        c.restore()
    }
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.velocity.x === 0 && this.velocity.y === 0) {
            this.openRate = 0
        } else {
            // Restore openRate if moving
            if (this.openRate === 0) this.openRate = this.defaultOpenRate
            this.radians += this.openRate
            if (this.radians < 0 || this.radians > 0.75) {
                this.openRate = -this.openRate
            }
        }
    }

}

class Pellet {
    constructor({position}) {
        this.position = position
        this.radius = 3
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}

class PowerUp {
    constructor({position}) {
        this.position = position
        this.radius = 9
        this.time = 3000 // 5 seconds   
    }
    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'lightgreen'
        c.fill()
        c.closePath()
    }

}

const powerUps = []
const pellets = []
const boundaries = []
const ghosts = [
    new Ghost({
        position: {
        x: Boundary.width * 6 + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    }),
]

const pacman = new Pacman({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

const keys = {
    ArrowUp: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

let lastKey = ''

let score = 0

let highScore = localStorage.getItem('pacmanHighScore') ? parseInt(localStorage.getItem('pacmanHighScore')) : 0;
const highScoreElement = document.getElementById('highScoreElement');
highScoreElement.textContent = highScore;

const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
  ['|', ' ', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', '-', '8'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '.', '_', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', ']', '.', '.', '.', '[', ']', '.', '[', '-', '8'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '.', '^', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]


function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

map.forEach((row, y) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeHorizontal.png')
          })
        )
        break
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeVertical.png')
          })
        )
        break
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeCorner1.png')
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            color: 'blue',
            image: createImage('./assets/images/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            color: 'blue',
            image: createImage('./assets/images/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            color: 'blue',
            image: createImage('./assets/images/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * y
            },
            image: createImage('./assets/images/pipeConnectorLeft.png')
          })
        )
        break  
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * y + Boundary.height / 2
            },
          })
        )
        break    
      case 'p':
        powerUps.push(
          new PowerUp({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * y + Boundary.height / 2
            },
          })
        )
        break    
        
        }
    })
})

function circleRectangleCollision ({circle, rectangle}){
    const padding = Boundary.width / 2 - circle.radius - 1
    return    (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
            && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
            && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
            && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
    )
}

let animationId 
let scaredTimeoutId = null;
let paused = false;
let gameWon = false;

function showWinScreen() {
    c.save();
    c.globalAlpha = 0.7;
    c.fillStyle = "#000";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.globalAlpha = 1;
    c.fillStyle = "#3A86FF";
    c.font = "bold 48px 'Press Start 2P', monospace";
    c.textAlign = "center";
    c.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 - 40);
    c.font = "bold 32px 'Press Start 2P', monospace";
    c.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
    c.font = "bold 24px 'Press Start 2P', monospace";
    c.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 90);
    c.restore();

    updatePacmanLeaderboard(playerName, score, currentLevel);
}

let gameOver = false;

function showGameOver() {
    c.save();
    c.globalAlpha = 0.7;
    c.fillStyle = "#000";
    c.fillRect(0, 0, canvas.width, canvas.height);
    c.globalAlpha = 1;
    c.fillStyle = "#3A86FF";
    c.font = "bold 48px 'Press Start 2P', monospace";
    c.textAlign = "center";
    c.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
    c.font = "bold 32px 'Press Start 2P', monospace";
    c.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
    c.font = "bold 24px 'Press Start 2P', monospace";
    c.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 100);
    c.restore();

    updatePacmanLeaderboard(playerName, score, currentLevel); // <-- Pass currentLevel here
}

function animate() {
    if (gameOver) {
        showGameOver();
        return;
    }
    if (gameWon) {
        showWinScreen();
        return;
    }
    if (paused) {
        // Optionally, draw a paused overlay
        c.save();
        c.globalAlpha = 0.7;
        c.fillStyle = "#000";
        c.fillRect(0, 0, canvas.width, canvas.height);
        c.globalAlpha = 1;
        c.fillStyle = "#3A86FF";
        c.font = "bold 48px 'Press Start 2P', monospace";
        c.textAlign = "center";
        c.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        c.restore();
        return;
    }
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    
    if (lastKey === 'ArrowUp') {
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleRectangleCollision({
                    circle: {
                        ...pacman, 
                        velocity: {
                             x: 0, 
                             y: -5
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                pacman.velocity.y = 0
                break
            } else { 
                pacman.velocity.y = -5
            }
                
        }

    } else if (lastKey === 'ArrowDown') { //Add keys.ArrowDown.pressed &&  for original Code
        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleRectangleCollision({
                    circle: {
                        ...pacman, 
                        velocity: {
                             x: 0, 
                             y: 5
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                pacman.velocity.y = 0
                break
            } else { 
                pacman.velocity.y = 5
            }
                
        }

    } else if (lastKey === 'ArrowLeft') {

        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleRectangleCollision({
                    circle: {
                        ...pacman, 
                        velocity: {
                             x: -5, 
                             y: 0
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                pacman.velocity.x = 0
                break
            } else { 
                pacman.velocity.x = -5
            }
                
        }

    } else if (lastKey === 'ArrowRight') {

        for (let i =0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleRectangleCollision({
                    circle: {
                        ...pacman, 
                        velocity: {
                             x: 5, 
                             y: 0
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                pacman.velocity.x = 0
                break
            } else { 
                pacman.velocity.x = 5
            }
                
        }

    }
    
    // Detect collision with ghosts //

    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]
        ghost.draw()

    //Ghost Touches Pacman //

        if 
            (Math.hypot(
            ghost.position.x - pacman.position.x, 
            ghost.position.y - pacman.position.y
        )   < ghost.radius + pacman.radius) 
        {   if (ghost.scared) {
            ghosts.splice(i, 1)
             score += levelModes[currentLevel].ghostScore
            scoreElement.innerHTML = score
            // After updating score:
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('pacmanHighScore', highScore);
            }
}
            else {
            console.log('you lose')
            gameOver = true;
            console.log('Game Over')
            }
        }
    }

    // Win Condition //
    if (pellets.length === 0) {
    gameWon = true;
}
    // This is the power-up collection code //

    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.draw();
        if (
            Math.hypot(
                powerUp.position.x - pacman.position.x, 
                powerUp.position.y - pacman.position.y
            ) < powerUp.radius + pacman.radius
        ) {
            console.log('power up collected');
            powerUps.splice(i, 1);
            // Set all ghosts to scared
            ghosts.forEach(ghost => {
                ghost.scared = true;
                console.log('Ahhh shit he got the magic bean!!!');
            });

            // Reset the timeout to 5 seconds
            if (scaredTimeoutId) clearTimeout(scaredTimeoutId);
            scaredTimeoutId = setTimeout(() => {
                ghosts.forEach(ghost => {
                    ghost.scared = false;
                    console.log('No More Magic Beans');
                });
                scaredTimeoutId = null;
            }, 3000);
        }
    }
    
    
    // This is the pellet collection code //
    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if 
            (Math.hypot(
            pellet.position.x - pacman.position.x, 
            pellet.position.y - pacman.position.y
        ) < pellet.radius + pacman.radius) 
        {console.log('yummy')
        pellets.splice(i, 1)
        score += levelModes[currentLevel].pelletScore
        scoreElement.innerHTML = score
        // After updating score:
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('pacmanHighScore', highScore);
        }
        }}

    boundaries.forEach(boundary => {
        boundary.draw()

        if (
            circleRectangleCollision({
                circle: pacman, 
                rectangle: boundary
            })
        ) {
            pacman.velocity.x = 0
            pacman.velocity.y = 0
            }
        
        })

    pacman.update()

    
    ghosts.forEach(ghost => {
        // Always set ghost speed to match current level and scared state
        if (ghost.scared) {
            ghost.speed = Math.max(1, levelModes[currentLevel].ghostSpeed)*0.5; // Slow down when scared
        } else {
            ghost.speed = levelModes[currentLevel].ghostSpeed;
        }

        const collisions = [];
        ghost.update()

        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleRectangleCollision({
                    circle: {
                        ...ghost, 
                        velocity: {
                             x: ghost.speed, 
                             y: 0
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }

            if (
                !collisions.includes('left') &&
                circleRectangleCollision({
                    circle: {
                        ...ghost, 
                        velocity: {
                             x: -ghost.speed, 
                             y: 0
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }

            if (
                !collisions.includes('up') &&
                circleRectangleCollision({
                    circle: {
                        ...ghost, 
                        velocity: {
                             x: 0, 
                             y: -ghost.speed
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }

            if (
                !collisions.includes('down') &&
                circleRectangleCollision({
                    circle: {
                        ...ghost, 
                        velocity: {
                             x: 0, 
                             y: ghost.speed
                        }
                    }, 
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })
        if (collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

          
            const pathways = ghost.prevCollisions.filter(collsion => {
                return !collisions.includes(collsion)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break;
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break;
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break;
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break;
            }

            ghost.prevCollisions = []
                    
    }
        
    })
    if      (pacman.velocity.x > 0) pacman.rotation = 0 // Facing right
    else if (pacman.velocity.x < 0) pacman.rotation = Math.PI // Facing left
    else if (pacman.velocity.y < 0) pacman.rotation = -Math.PI / 2 // Facing up
    else if (pacman.velocity.y > 0) pacman.rotation = Math.PI / 2 // Facing down 
} // End of animate function

animate()

addEventListener('keydown', (event) => {
    if (event.code === "Space") {
        paused = !paused;
        if (!paused) {
            animate(); // Resume animation
        }
        return; // Prevent other actions on spacebar
    }
    switch (event.key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = 'ArrowUp'
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = true 
            lastKey = 'ArrowDown'
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = 'ArrowLeft'
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = 'ArrowRight'
            break;
        case 'r':
        case 'R':
            resetGame();
            break;
    }}
)
addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = false
            break;
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break;
    }}
)

const numRows = map.length;
const numCols = map[0].length;

canvas.width = numCols * Boundary.width;
canvas.height = numRows * Boundary.height;

function resetGame() {
    gameOver = false;
    gameWon = false;
    // Stop animation
    cancelAnimationFrame(animationId);

    // Reset arrays and variables
    pellets.length = 0;
    powerUps.length = 0;
    boundaries.length = 0;
    ghosts.length = 0;
    score = 0;
    scoreElement.innerHTML = score;
    lastKey = '';
    if (scaredTimeoutId) clearTimeout(scaredTimeoutId);

    // Re-create ghosts based on difficulty
    const ghostSettings = [
        { x: Boundary.width * 20 + Boundary.width / 2, y: Boundary.height * 01 + Boundary.height / 2, color: 'pink' },
        { x: Boundary.width * 15 + Boundary.width / 2, y: Boundary.height * 05 + Boundary.height / 2, color: 'red' },
        { x: Boundary.width * 25 + Boundary.width / 2, y: Boundary.height * 11 + Boundary.height / 2, color: 'cyan' },
        { x: Boundary.width * 23 + Boundary.width / 2, y: Boundary.height * 05 + Boundary.height / 2, color: 'orange' },
        { x: Boundary.width * 08 + Boundary.width / 2, y: Boundary.height * 11 + Boundary.height / 2, color: 'green' },
        { x: Boundary.width * 08 + Boundary.width / 2, y: Boundary.height * 07 + Boundary.height / 2, color: 'lightblue' },
        { x: Boundary.width * 15 + Boundary.width / 2, y: Boundary.height * 11 + Boundary.height / 2, color: 'violet' },
        { x: Boundary.width * 02 + Boundary.width / 2, y: Boundary.height * 11 + Boundary.height / 2, color: 'purple' }

    ];
    const ghostCount = levelModes[currentLevel].ghostCount;
    const ghostSpeed = levelModes[currentLevel].ghostSpeed;

    for (let i = 0; i < ghostCount; i++) {
        ghosts.push(
            new Ghost({
                position: { x: ghostSettings[i].x, y: ghostSettings[i].y },
                velocity: { x: ghostSpeed, y: 0 },
                color: ghostSettings[i].color
            })
        );
    }

    // Reset Pacman
    pacman.position = {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    };
    pacman.velocity = { x: 0, y: 0 };
    pacman.radians = 0.75;
    pacman.openRate = pacman.defaultOpenRate;
    pacman.rotation = 0;

    // Rebuild map
    map.forEach((row, y) => {
        row.forEach((symbol, j) => {
            switch (symbol) {
                case '-':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeHorizontal.png')
              })
            )
            break
          case '|':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeVertical.png')
              })
            )
            break
          case '1':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeCorner1.png')
              })
            )
            break
          case '2':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeCorner2.png')
              })
            )
            break
          case '3':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeCorner3.png')
              })
            )
            break
          case '4':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeCorner4.png')
              })
            )
            break
          case 'b':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/block.png')
              })
            )
            break
          case '[':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/capLeft.png')
              })
            )
            break
          case ']':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/capRight.png')
              })
            )
            break
          case '_':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/capBottom.png')
              })
            )
            break
          case '^':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/capTop.png')
              })
            )
            break
          case '+':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeCross.png')
              })
            )
            break
          case '5':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                color: 'blue',
                image: createImage('./assets/images/pipeConnectorTop.png')
              })
            )
            break
          case '6':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                color: 'blue',
                image: createImage('./assets/images/pipeConnectorRight.png')
              })
            )
            break
          case '7':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                color: 'blue',
                image: createImage('./assets/images/pipeConnectorBottom.png')
              })
            )
            break
          case '8':
            boundaries.push(
              new Boundary({
                position: {
                  x: Boundary.width * j,
                  y: Boundary.height * y
                },
                image: createImage('./assets/images/pipeConnectorLeft.png')
              })
            )
            break  
          case '.':
            pellets.push(
              new Pellet({
                position: {
                  x: Boundary.width * j + Boundary.width / 2,
                  y: Boundary.height * y + Boundary.height / 2
                },
              })
            )
            break    
          case 'p':
            powerUps.push(
              new PowerUp({
                position: {
                  x: Boundary.width * j + Boundary.width / 2,
                  y: Boundary.height * y + Boundary.height / 2
                },
              })
            )
            break    
            
            }
        })
    });

    // Restart animation
    animate();
}
resetGame();

function showNameModal(initialName, callback) {
    const modal = document.getElementById('nameModal');
    const input = document.getElementById('nameInput');
    const btn = document.getElementById('nameSubmitBtn');
    modal.style.display = 'flex';
    input.value = initialName || '';
    input.focus();

    function submit() {
        let name = input.value.trim();
        if (!name) name = 'Anonymous';
        modal.style.display = 'none';
        callback(name);
    }

    btn.onclick = submit;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') submit();
    };
}

// Usage on load:
let playerName = localStorage.getItem('pacmanPlayerName') || '';
showNameModal('', function(name) {
    playerName = name;
    localStorage.setItem('pacmanPlayerName', playerName);
    const nameSpan = document.getElementById('playerNameSpan');
    if (nameSpan) nameSpan.textContent = playerName;
});

// For changing name on click:
const nameContainer = document.querySelector('.PacmanName');
if (nameContainer) {
    nameContainer.style.cursor = 'pointer';
    nameContainer.title = 'Click to change player name';
    nameContainer.addEventListener('click', () => {
        showNameModal('', function(newName) {
            playerName = newName;
            localStorage.setItem('pacmanPlayerName', playerName);
            const nameSpan = document.getElementById('playerNameSpan');
            if (nameSpan) nameSpan.textContent = playerName;
        });
    });
}

function updatePacmanLeaderboard(name, score, difficulty) {
    let leaderboard = JSON.parse(localStorage.getItem('pacmanLeaderboard') || '[]');
    leaderboard.push({ name, score, difficulty });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    localStorage.setItem('pacmanLeaderboard', JSON.stringify(leaderboard));
}
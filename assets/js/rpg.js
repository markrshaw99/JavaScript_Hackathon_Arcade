document.addEventListener("DOMContentLoaded", function() {
    //set background image here to pretend flickering
    document.getElementById("RPG-game").style.backgroundImage = "url('assets/images/RPG/Background.jpg')";
    document.getElementById("RPG-game").style.backgroundSize = "cover";
    document.getElementById("RPG-game").style.backgroundPosition = "center";
    document.getElementById("action1").addEventListener("click", action1);
    document.getElementById("action2").addEventListener("click", action2);
    document.getElementById("action3").addEventListener("click", action3);
    document.getElementById("action4").addEventListener("click", action4);
    encounter();
});

const player = {
    name: "Krystal",
    hp: 80,
    mp: 80,
    physAttack:50,
    magAttack: 70,
    physDef: 40,
    magDef: 60
};

const enemyStats = {
    name: "Polaris",
    hp: 40,
    physAttack: 30,
    magAttack: 50,
    physDef: 50,
    magDef: 30
};

const enemySpecies = ["Polaris", "Sukoro", "Incato", "Miniath"]
const enemySprite = ["assets/images/RPG/Polaris.png", "assets/images/RPG/Suka.png", "assets/images/RPG/Incu.png", "assets/images/RPG/Miniath.png"]
const enemyHP= [50, 80, 60, 70];
const enemyAttack = [30, 20, 50, 40];
const enemyDef = [50, 30, 40, 60];
const enemyMagAttack = [50, 60, 40, 50];
const enemyMagDef = [30, 50, 30, 10];

let textBox = document.getElementById("textBox");
let confirm = document.getElementById("confirm");

function resetConfirmListeners() {
    let refreshConfirm = confirm.cloneNode(true);
    confirm.parentNode.replaceChild(refreshConfirm, confirm);
    confirm = refreshConfirm;
}

function randomEnemy() {
    let enemyType = Math.floor(Math.random() * enemySpecies.length);
    enemyMonster= document.getElementById("enemySprite");
    enemyMonster.src = enemySprite[enemyType];
    enemyMonster.alt = enemySpecies[enemyType];
    enemyStats.name = enemySpecies[enemyType];
    enemyStats.hp = enemyHP[enemyType];
    enemyStats.physAttack = enemyAttack[enemyType];
    enemyStats.magAttack = enemyMagAttack[enemyType];
    enemyStats.physDef = enemyDef[enemyType];
    enemyStats.magDef = enemyMagDef[enemyType];
    console.log("New enemy spawned:", enemyStats.name, "HP:", enemyStats.hp);
}
let enemyDefeated = 0;

function updateHealth() {
    let playerHP = document.getElementById("playerHealth");
    playerHP.innerHTML = `HP: ${player.hp}`;
    let enemyHP = document.getElementById("enemyHealth");
    console.log("playerHP:", playerHP, "enemyHP:", enemyHP);
    if (!playerHP || !enemyHP) {
        throw new Error("playerHP or enemyHP element not found!");
    }
    enemyHP.innerHTML = `${enemyStats.name} HP: ${enemyStats.hp}`;
    console.log("Player HP:", player.hp, "Enemy HP:", enemyStats.hp);
}

function action1() {
    confirm.style.display = "block";
    textBox.innerHTML= 'Kitsuro bares her fangs!';
    let damage = Math.round((player.physAttack * 30) / enemyStats.physDef);
    enemyStats.hp -= damage;
    enemyStats.hp = Math.max(enemyStats.hp, 0); // Ensure HP doesn't go below 0
    updateHealth();
    resetConfirmListeners();
    confirm.addEventListener("click", function() {
        statusCheck();
    });
}
function action2() {
    confirm.style.display = "block";
    textBox.innerHTML=`Kitsuro blasts ${enemyStats.name} with darkness!`;
    let damage = Math.round((player.magAttack * 30) / enemyStats.magDef);
    enemyStats.hp -= damage;
    enemyStats.hp = Math.max(enemyStats.hp, 0); // Ensure HP doesn't go below 0
    updateHealth();
    resetConfirmListeners();
    confirm.addEventListener("click", function() {
        statusCheck();
    });
}

function action3() {
    confirm.style.display = "block";
    textBox.innerHTML='Kitsuro crouches low and braces herself!';
    player.physDef += 10;
    player.magDef += 10;
    resetConfirmListeners();
    confirm.addEventListener("click", function() {
        statusCheck();
    });
}

function action4() {
    confirm.style.display = "block";
    textBox.innerHTML='You feed Kitsuro some sushi! Her HP is restored!';
    player.hp += 20;
    if (player.hp > 80) {
        player.hp = 80; // Max HP
    }
    updateHealth();
    resetConfirmListeners();
    confirm.addEventListener("click", function() {
        statusCheck();
    });
}

function statusCheck() {
    confirm.style.display = "block";
    if (enemyStats.hp <= 0) {
        textBox.innerHTML=`${enemyStats.name} has been defeated!`;
        enemyDefeated++;
        resetConfirmListeners();
        confirm.addEventListener("click", function() {
            encounter();
        });
    } else if (player.hp <= 0) {
        confirm.style.display = "none";
        textBox.innerHTML="Kitsuro has been defeated! Run back to safety!";
        //add game over modal with high score option
        endGame();
    } else {
        enemyTurn();
    }
}

function encounter() {
    if (enemyDefeated >= 4) {
       textBox.innerHTML= 'All the demons have been defeated! Advance forward, hero!';
        // Add in high score modal here
        endGame();
    } else {
        randomEnemy();
        updateHealth();
        textBox.innerHTML= `Careful, a feral ${enemyStats.name} is in the way!`;
        resetConfirmListeners();
        confirm.addEventListener("click", function() {
            confirm.style.display = "none";
            textBox.innerHTML = "What will you do?";
    });
}
}

function enemyTurn() {
    confirm.style.display = "block";
    let enemyAction = Math.floor(Math.random() * 2);
    if (enemyAction === 0) {
        textBox.innerHTML=`${enemyStats.name} attacks Kitsuro!`;
        let damage = Math.round((enemyStats.physAttack * 30) / player.physDef);
        player.hp -= damage;
        player.hp = Math.max(player.hp, 0); // Ensure HP doesn't go below 0
        resetConfirmListeners();
        confirm.addEventListener("click", function() {
            updateHealth();
        }); 
        if (player.hp <= 0) {
            confirm.style.display = "none";
            textBox.innerHTML="Kitsuro has been defeated! Run back to safety!";
            //add game over modal with high score option
            endGame();
        }
        else {
            confirm.addEventListener("click", function() {
                confirm.style.display = "none";
                textBox.innerHTML = "What will you do?";
            });
     }
    } else {
        textBox.innerHTML=`${enemyStats.name} blasts Kitsuro with magic!`;
        let damage = Math.round((enemyStats.magAttack * 30) / player.magDef);
        player.hp -= damage;
        player.hp = Math.max(player.hp, 0); // Ensure HP doesn't go below 0
        resetConfirmListeners();
        confirm.addEventListener("click", function() {
            updateHealth();
        });
        if (player.hp <= 0) {
            confirm.style.display = "none";
            textBox.innerHTML="Kitsuro has been defeated! Run back to safety!";
            //add game over modal with high score option
            endGame();
        }
        else {
            confirm.addEventListener("click", function() {
                confirm.style.display = "none";
                textBox.innerHTML = "What will you do?";
            });
        }
        }
}

function endGame() {
    document.getElementById("action1").removeEventListener("click", action1);
    document.getElementById("action2").removeEventListener("click", action2);
    document.getElementById("action3").removeEventListener("click", action3);
    document.getElementById("action4").removeEventListener("click", action4);
}


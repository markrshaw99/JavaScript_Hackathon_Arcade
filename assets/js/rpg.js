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
const enemyHP= [40, 70, 50, 60];
const enemyAttack = [30, 20, 50, 40];
const enemyDef = [50, 20, 30, 60];
const enemyMagAttack = [50, 60, 40, 50];
const enemyMagDef = [30, 50, 30, 10];



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
    alert('Kitsuro bares her fangs!');
    let damage = Math.round((player.physAttack * 30) / enemyStats.physDef);
    enemyStats.hp -= damage;
    enemyStats.hp = Math.max(enemyStats.hp, 0); // Ensure HP doesn't go below 0
    updateHealth();
    statusCheck();
}
function action2() {
    alert(`Kitsuro blasts ${enemyStats.name} with darkness!`);
    let damage = Math.round((player.magAttack * 30) / enemyStats.magDef);
    enemyStats.hp -= damage;
    enemyStats.hp = Math.max(enemyStats.hp, 0); // Ensure HP doesn't go below 0
    updateHealth();
    statusCheck();
}

function action3() {
    alert('Kitsuro crouches low and braces herself!');
    player.physDef += 10;
    player.magDef += 10;
    statusCheck();
}

function action4() {
    alert('You feed Kitsuro some sushi! Her HP is restored!');
    player.hp += 20;
    if (player.hp > 80) {
        player.hp = 80; // Max HP
    }
    updateHealth();
    statusCheck();
}

function statusCheck() {
    if (enemyStats.hp <= 0) {
        alert(`${enemyStats.name} has been defeated!`);
        enemyDefeated++;
        encounter();
    } else if (player.hp <= 0) {
        alert("Kitsuro has been defeated! Run back to safety!");
        //add game over modal with high score option
        endGame();
    } else {
        enemyTurn();
    }
}

function encounter() {
    if (enemyDefeated >= 4) {
        alert("All the demons have been defeated! Advance forward, hero!");
        // Add in high score modal here
        endGame();
    } else {
        randomEnemy();
        updateHealth();
        alert(`Careful, a feral ${enemyStats.name} is in the way!`);
    }
}

function enemyTurn() {
    let enemyAction = Math.floor(Math.random() * 2);
    if (enemyAction === 0) {
        alert(`${enemyStats.name} attacks Kitsuro!`);
        let damage = Math.round((enemyStats.physAttack * 30) / player.physDef);
        player.hp -= damage;
        player.hp = Math.max(player.hp, 0); // Ensure HP doesn't go below 0
    } else {
        alert(`${enemyStats.name} blasts Kitsuro with magic!`);
        let damage = Math.round((enemyStats.magAttack * 30) / player.magDef);
        player.hp -= damage;
        player.hp = Math.max(player.hp, 0); // Ensure HP doesn't go below 0
    }
    updateHealth();
    if (player.hp <= 0) {
        alert("Kitsuro has been defeated! Run back to safety!");
        //add game over modal with high score option
        endGame();
    }
}

function endGame() {
    document.getElementById("action1").removeEventListener("click", action1);
    document.getElementById("action2").removeEventListener("click", action2);
    document.getElementById("action3").removeEventListener("click", action3);
    document.getElementById("action4").removeEventListener("click", action4);
}


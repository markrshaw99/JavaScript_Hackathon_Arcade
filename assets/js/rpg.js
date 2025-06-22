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
const enemySprite = ["../images/RPG/Polaris.png", "../images/RPG/Suka.png", "../images/RPG/Incu.png", "../images/RPG/Miniath.png"]
const enemyHP= [40, 70, 50, 60];
const enemyAttack = [30, 20, 50, 40];
const enemyDef = [50, 20, 30, 60];
const enemyMagAttack = [50, 60, 40, 50];
const enemyMagDef = [30, 50, 30, 10];



function randomEnemy() {
    let enemyType = Math.round(Math.random()) * 5;
    enemyMonster= document.getElementById("enemy-monster");
    enemyMonster.src = enemySprite[enemyType];
    enemyMonster.alt = enemySpecies[enemyType];
    enemyStats.name = enemySpecies[enemyType];
    enemyStats.hp = enemyHP[enemyType];
    enemyStats.physAttack = enemyAttack[enemyType];
    enemyStats.magAttack = enemyMagAttack[enemyType];
    enemyStats.physDef = enemyDef[enemyType];
    enemyStats.magDef = enemyMagDef[enemyType];
}
let enemyDefeated = 0;

function playerAttack() {
    
}

while (player.hp > 0 && enemyDefeated < 4) {
    randomEnemy();
    playerHP = document.getElementById("playerHealth");
    playerHP.innerHTML = `HP: ${player.hp}`;
    enemyHP = document.getElementById("enemyHealth");
    enemyHP.innerHTML = `${enemyStats.enemySpecies}HP: ${enemyStats.hp}`;
    alert (`Careful, a feral ${enemyStats.name} is in the way!`);


}
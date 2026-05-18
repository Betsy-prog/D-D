// This file does 4 things:
// 1. Navigation hamburger menu
// 2. Ember particle effect on the hero
// 3. Accordion open/close (How to Play)
// 4. Battle Demo (the main D&D combat game)
// ================================================


// ================================================
// 1. NAVIGATION — HAMBURGER MENU
//
// On mobile, the nav links are hidden.
// Clicking the ☰ button shows/hides them.
// ================================================

const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', function() {
  // "classList.toggle" adds the class if missing, removes if present
  navLinks.classList.toggle('open');

  // Also toggle ☰ / ✕ symbol on the button itself
  if (navLinks.classList.contains('open')) {
    menuBtn.textContent = '✕';
  } else {
    menuBtn.textContent = '☰';
  }
});

// Close the menu when any nav link is clicked
navLinks.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('open');
    menuBtn.textContent = '☰';
  });
});

// Make navbar background darker after scrolling down
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(5, 5, 5, 0.98)';
  } else {
    navbar.style.background = 'rgba(10, 10, 10, 0.95)';
  }
});


// ================================================
// 2. EMBER PARTICLES
//
// Creates small floating dots in the hero section.
// Each dot gets a random size, position, and speed.
// The CSS @keyframes "floatUp" animates them upward.
// ================================================

function createEmbers() {
  const container = document.getElementById('embers');

  // Create 40 ember dots
  for (let i = 0; i < 40; i++) {

    // createElement makes a new HTML element in JavaScript
    const ember = document.createElement('div');
    ember.classList.add('ember');

    // Math.random() gives a random number from 0 to 1
    const size     = Math.random() * 4 + 2;       // 2px to 6px
    const startX   = Math.random() * 100;          // 0% to 100%
    const duration = Math.random() * 4 + 4;        // 4s to 8s
    const delay    = Math.random() * 6;            // stagger start
    const drift    = (Math.random() - 0.5) * 60;  // -30px to +30px

    // Set the ember's visual style
    ember.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      bottom: 0;
      background: ${Math.random() > 0.5 ? '#C9A84C' : '#8B0000'};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --drift: ${drift}px;
    `;

    // Add the ember to the container div
    container.appendChild(ember);
  }
}

// Run createEmbers when the page loads
createEmbers();


// ================================================
// 3. ACCORDION — HOW TO PLAY
//
// Each step has a button header and a hidden body.
// Clicking the button opens/closes the body.
// We call this function from onclick="" in the HTML.
// ================================================

function toggleAccordion(button) {
  // .parentElement goes up one level to the .acc-item div
  const item = button.parentElement;

  // Find the hidden body inside this item
  const body = item.querySelector('.acc-body');

  // The + / - symbols in the button
  const icon = button.querySelector('span:last-child');

  // Check if it's already open
  const isOpen = body.classList.contains('open');

  // First, close ALL accordion items
  document.querySelectorAll('.acc-body').forEach(function(b) {
    b.classList.remove('open');
  });
  document.querySelectorAll('.acc-btn span:last-child').forEach(function(ic) {
    ic.textContent = '+';
  });

  // If it was closed, open it. If it was already open, leave it closed.
  if (!isOpen) {
    body.classList.add('open');
    icon.textContent = '−';
  }
}


// ================================================
// 4. BATTLE DEMO
//
// Turn-based D&D combat: You vs Goblin.
//
// GAME STATE — all the numbers live here.
// Whenever something changes (HP drops, round ticks),
// it updates this object then refreshes the UI.
// ================================================

// This object holds all battle data
const game = {
  playerHP:    20,    
  playerMax:   20,   
  playerAC:    16,    // player armor class
  enemyHP:     7,     
  enemyMax:    7,     
  enemyAC:     15,    // goblin armor class
  round:       1,     
  isDodging:   false, // is the player dodging this round?
  gameOver:    false, // has the fight ended?
};

// ---- DICE ROLLING ----
// The core of D&D math
// rollDie(20) gives a random number from 1 to 20
function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
  // Math.floor rounds DOWN to a whole number
  // Math.random() * 20 = 0.0 to 19.999...
  // + 1 makes it 1 to 20
}

// ---- DICE ANIMATION ----
// Spins the dice display, then shows the result
function animateDice(result, afterAnimation) {
  const box = document.getElementById('diceBox');
  const num = document.getElementById('diceNum');

  // Add spinning class
  box.classList.add('rolling');
  num.textContent = '...';

  // Cycle through emojis to look like rolling
  const faces = ['⚀','⚁','⚂','⚃','⚄','⚅','🎲'];
  let frame = 0;
  const spin = setInterval(function() {
    box.textContent = faces[frame % faces.length];
    // We need to re-add the num div because textContent clears it
    box.appendChild(num);
    frame++;
  }, 80);

  // After 600ms, stop spinning and show real result
  setTimeout(function() {
    clearInterval(spin);
    box.classList.remove('rolling');
    box.textContent = '🎲';
    box.appendChild(num);
    num.textContent = result;

    // Run whatever should happen AFTER the dice animation
    afterAnimation();
  }, 600);
}

// ---- ADD A LINE TO THE COMBAT LOG ----
// type = 'player', 'enemy', 'miss', 'crit', 'sys', 'win', 'lose', 'dodge'
function addLog(message, type) {
  const log = document.getElementById('combatLog');

  const line = document.createElement('p');
  line.classList.add('log', type || 'sys');
  line.textContent = message;

  log.appendChild(line);

  // Auto-scroll to the bottom so newest message is visible
  log.scrollTop = log.scrollHeight;
}

// ---- UPDATE THE HP BARS ----
// Called after every attack to sync the UI with the game object
function updateBars() {
  // Player bar
  const pHP  = document.getElementById('playerHP');
  const pBar = document.getElementById('playerBar');
  const pAmt = Math.max(0, game.playerHP); // never goes below 0 on display

  pHP.textContent = pAmt;
  const pPct = (pAmt / game.playerMax) * 100; // percentage of HP remaining
  pBar.style.width = pPct + '%';

  // Change bar color based on HP %
  pBar.className = 'hp-fill green'; // reset classes
  if (pPct <= 50) pBar.classList.replace('green', 'hp-fill');
  if (pPct <= 50) pBar.classList.add('warning');
  if (pPct <= 25) { pBar.classList.remove('warning'); pBar.classList.add('critical'); }

  // Enemy bar
  const eHP  = document.getElementById('enemyHP');
  const eBar = document.getElementById('enemyBar');
  const eAmt = Math.max(0, game.enemyHP);

  eHP.textContent = eAmt;
  const ePct = (eAmt / game.enemyMax) * 100;
  eBar.style.width = ePct + '%';

  eBar.className = 'hp-fill red';
  if (ePct <= 50) eBar.classList.add('warning');
  if (ePct <= 25) { eBar.classList.remove('warning'); eBar.classList.add('critical'); }
}

// ---- DISABLE / ENABLE ACTION BUTTONS ----
// We disable them during the enemy's turn
function setButtons(enabled) {
  document.querySelectorAll('.actions .btn').forEach(function(btn) {
    btn.disabled = !enabled;
  });
}

// ---- HIT ANIMATION ----
// Makes a sprite flash or wobble when attacked
function animateSprite(sideId, type) {
  const sprite = document.querySelector('#' + sideId + ' .fighter-sprite');
  if (!sprite) return;

  sprite.classList.add(type);
  // Remove the class after animation finishes so it can replay
  setTimeout(function() {
    sprite.classList.remove(type);
  }, 500);
}

// ---- CHECK IF BATTLE IS OVER ----
function checkEnd() {
  if (game.enemyHP <= 0) {
    endBattle('win');
    return true;
  }
  if (game.playerHP <= 0) {
    endBattle('lose');
    return true;
  }
  return false; // battle continues
}

// ---- END THE BATTLE ----
function endBattle(result) {
  game.gameOver = true;
  setButtons(false);

  if (result === 'win') {
    addLog('', 'sys');
    addLog('🏆 VICTORY! The goblin collapses! You earn 50 XP!', 'win');
    addLog('You survived your first encounter. The adventure begins...', 'win');
    animateSprite('enemySide', 'hit');
  } else {
    addLog('', 'sys');
    addLog('💀 You have fallen. 0 HP. Make your death saving throws...', 'lose');
    addLog('Roll d20 each turn: 10+ = success, 9 or less = failure. 3 of either decides fate.', 'sys');
    animateSprite('playerSide', 'hit');
  }

  // Show the "Fight Again" button
  setTimeout(function() {
    document.getElementById('restartBtn').style.display = 'block';
  }, 800);
}

// ---- PLAYER ACTION ----
// Called by onclick="" on the action buttons.
// action = 'attack', 'spell', or 'dodge'
function playerAction(action) {
  if (game.gameOver) return; // do nothing if battle is over

  // Disable buttons so player can't click again mid-animation
  setButtons(false);
  game.isDodging = false; // reset dodge from last round

  // Roll the d20
  const roll = rollDie(20);

  // Spin the dice, then run the combat logic after
  animateDice(roll, function() {

    if (action === 'dodge') {
      // DODGE: no attack, but AC is raised this round
      game.isDodging = true;
      addLog('🛡️ You take the Dodge action! Your AC rises to ' + (game.playerAC + 4) + ' this round.', 'dodge');
      animateSprite('playerSide', 'dodge');

      // Enemy still gets a turn after dodge
      setTimeout(enemyTurn, 1200);

    } else if (action === 'attack') {
      // MELEE ATTACK
      const bonus = 5;                   // Fighter's attack bonus
      const total = roll + bonus;        // total attack roll

      addLog('⚔️ You swing your sword! Rolled ' + roll + ' + ' + bonus + ' = ' + total + ' vs Goblin AC ' + game.enemyAC, 'player');

      if (roll === 20) {
        // CRITICAL HIT — roll damage twice!
        const dmg = rollDie(8) + rollDie(8) + 3;
        game.enemyHP -= dmg;
        addLog('💥 CRITICAL HIT! Double dice! ' + dmg + ' damage!', 'crit');
        animateSprite('enemySide', 'hit');
      } else if (total >= game.enemyAC) {
        // NORMAL HIT
        const dmg = rollDie(8) + 3;
        game.enemyHP -= dmg;
        addLog('✅ Hit! You deal ' + dmg + ' damage. Goblin HP: ' + Math.max(0, game.enemyHP), 'player');
        animateSprite('enemySide', 'hit');
      } else if (roll === 1) {
        // CRITICAL MISS — rolling a 1 always fails
        addLog('💨 Critical Miss! You stumble. The goblin laughs.', 'miss');
        animateSprite('playerSide', 'dodge');
      } else {
        // NORMAL MISS
        addLog('❌ Miss! Attack of ' + total + ' doesn\'t beat AC ' + game.enemyAC + '.', 'miss');
      }

      updateBars();
      if (!checkEnd()) {
        setTimeout(enemyTurn, 1200); // enemy attacks after 1.2 seconds
      }

    } else if (action === 'spell') {
      // FIREBOLT CANTRIP (ranged spell attack)
      const bonus = 4;
      const total = roll + bonus;

      addLog('🔥 You hurl a Firebolt! Rolled ' + roll + ' + ' + bonus + ' = ' + total + ' vs Goblin AC ' + game.enemyAC, 'player');

      if (roll === 20) {
        const dmg = rollDie(10) + rollDie(10); // crit = 2d10
        game.enemyHP -= dmg;
        addLog('💥 CRITICAL SPELL! Scorching flames deal ' + dmg + ' fire damage!', 'crit');
        animateSprite('enemySide', 'hit');
      } else if (total >= game.enemyAC) {
        const dmg = rollDie(10); // normal = 1d10
        game.enemyHP -= dmg;
        addLog('🔥 Firebolt hits! ' + dmg + ' fire damage! Goblin HP: ' + Math.max(0, game.enemyHP), 'player');
        animateSprite('enemySide', 'hit');
      } else {
        addLog('💨 Firebolt fizzles past the goblin. Miss!', 'miss');
      }

      updateBars();
      if (!checkEnd()) {
        setTimeout(enemyTurn, 1200);
      }
    }
  });
}

// ---- ENEMY TURN ----
// The goblin automatically attacks. Runs after each player action.
function enemyTurn() {
  if (game.gameOver) return;

  addLog('👺 Goblin\'s turn...', 'sys');

  const roll  = rollDie(20);
  const bonus = 4;
  const total = roll + bonus;

  // If player dodged, their AC is higher this round
  const targetAC = game.isDodging ? game.playerAC + 4 : game.playerAC;

  animateDice(roll, function() {
    addLog('👺 Goblin attacks! Rolled ' + roll + ' + ' + bonus + ' = ' + total + ' vs your AC ' + targetAC, 'enemy');

    if (roll === 20) {
      const dmg = rollDie(6) + rollDie(6) + 2; // goblin crit = 2d6+2
      game.playerHP -= dmg;
      addLog('💥 Goblin CRITS! Vicious strike deals ' + dmg + ' damage!', 'crit');
      animateSprite('playerSide', 'hit');
    } else if (total >= targetAC) {
      const dmg = rollDie(6) + 2; // normal goblin hit = 1d6+2
      game.playerHP -= dmg;
      addLog('❗ Goblin hits you for ' + dmg + ' damage! Your HP: ' + Math.max(0, game.playerHP), 'enemy');
      animateSprite('playerSide', 'hit');
    } else if (game.isDodging) {
      addLog('🛡️ Your Dodge works! The goblin\'s attack misses completely!', 'dodge');
    } else {
      addLog('💨 Goblin misses! The attack clangs off your armor.', 'miss');
    }

    updateBars();

    if (!checkEnd()) {
      // Start next round and give player their turn back
      game.round++;
      document.getElementById('roundNum').textContent = game.round;
      addLog('— Round ' + game.round + ' —', 'sys');
      setButtons(true);
    }
  });
}

// ---- RESTART BATTLE ----
// Called by the "Fight Again" button
function restartBattle() {
  // Reset all game numbers
  game.playerHP  = game.playerMax;
  game.enemyHP   = game.enemyMax;
  game.round     = 1;
  game.isDodging = false;
  game.gameOver  = false;

  // Reset the UI
  updateBars();
  document.getElementById('roundNum').textContent = '1';
  document.getElementById('diceNum').textContent  = '—';

  // Clear the combat log
  const log = document.getElementById('combatLog');
  log.innerHTML = '';
  addLog('⚔️ A new goblin drops from the ceiling! You go first.', 'sys');

  // Hide restart button, enable action buttons
  document.getElementById('restartBtn').style.display = 'none';
  setButtons(true);
}


// ================================================
// PAGE LOAD
// ================================================
// DOMContentLoaded fires when all the HTML has been
// built by the browser. It's the safe point to run JS
// that touches HTML elements.
document.addEventListener('DOMContentLoaded', function() {
  updateBars(); // Set HP bars to full on page load
  console.log('The Dragon\'s Keep loaded. Welcome, adventurer! 🐉');
});

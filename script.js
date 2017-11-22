var highlightCard = "";

var player1TurnCount = 0;

var player1 = {
	lifeTotal: 5,
	isTurn: true, //player1 always go first
	manapool: 0,
	cardsInHand: [],
	cardsInPlay: [],
	cardsInGraveyard: [],
	cardsInDeck: [],
	playLand: false,
	drewCard: true
};

var player2 = {
	lifeTotal: 5,
	isTurn: false,
	manapool: 0,
	cardsInHand: [],
	cardsInPlay: [],
	cardsInGraveyard: [],
	cardsInDeck: [],
	playLand: false,
	drewCard: false
};

var generateHands = function() { //generate the player hands, good for now
	for (var i=6; i>=0; i--) {
		var index1 = player1.cardsInDeck.splice(i,1);
		player1.cardsInHand.push(index1[0]);
		var index2 = player2.cardsInDeck.splice(i,1);
		player2.cardsInHand.push(index2[0]);
	}
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	//while there are elements to shuffle...
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random()*currentIndex);
		currentIndex--;

		//swap with the current element
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

var generateDecks = function() { //generate the player decks
	//from the creatures array grab 30 cards randomly, no more than 4 of each card
	//generate a reasonable amount of lands
	//push these into an ordered list, Last In First Out

	//generate 30 random Creatures, place into players deck
	for (let i=0; i<30; i++) {
		var randNum1 = Math.floor(Math.random()*greenCreatures.length); //rand creature
		var newCard = JSON.parse(JSON.stringify(greenCreatures[randNum1])); //random element of Creatures array
		player1.cardsInDeck.push(newCard); //push card into deck
	}

	for (let i=0; i<30; i++) {
		var randNum2 = Math.floor(Math.random()*redCreatures.length);
		var newCard = JSON.parse(JSON.stringify(redCreatures[randNum2]));
		player2.cardsInDeck.push(newCard);
	}

	//generate 15 random lands
	for (let j=0; j<15; j++) {
		var randNum1 = Math.floor(Math.random()*forest.length);
		var newLand = JSON.parse(JSON.stringify(forest[randNum1]));
		player1.cardsInDeck.push(newLand);
	}

	for (let j=0; j<15; j++) {
		var randNum2 = Math.floor(Math.random()*mountain.length);
		var newLand = JSON.parse(JSON.stringify(mountain[randNum2]));
		player2.cardsInDeck.push(newLand);
	}

	for (let i=0; i<player1.cardsInDeck.length; i++) {
		player1.cardsInDeck[i].cardId = "one" + i;
	}

	for (let i=0; i<player2.cardsInDeck.length; i++) {
		player2.cardsInDeck[i].cardId = "two" + i;
	}

	shuffle(player1.cardsInDeck);
	shuffle(player2.cardsInDeck);
}

var displayHand = function() {
	for (i=0; i<player1.cardsInHand.length; i++) {
		$("#showHand").append("<div class='hasCard highlight' style='background-image: url(img/"+ player1.cardsInHand[i].image +
			")' onclick='select(this.id)'  id="+ player1.cardsInHand[i].cardId +"></div>");
	}
}

var select = function(getCardId) { //onclick function from player1.cardsInHand
	$("#"+highlightCard).css("border", "black solid 1px")
	highlightCard = getCardId;

	$("#"+highlightCard).css("border", "white solid 2px")
	$("#playCard").attr("onclick", "selectFromHand(" + getCardId + ")");
}

var selectOnField = function(getCardId) {
	$("#tapCard").attr("onclick", "tapCard(" + getCardId + ")");
	$("#attack").attr("onclick", "attack(player1)");

	$("#"+highlightCard).css("border", "black solid 1px")
	highlightCard = getCardId;
	$("#"+highlightCard).css("border", "white solid 2px")
}

var selectFromHand = function(getCardId) { //param comes from Button with id=playCard,
	var selectedCard = $(getCardId).attr("id"); //the ID of the selected card
	var currentCard = player1.cardsInHand; //the object of the selected card
	console.log(currentCard)

	var cardToBattlefield = function() {
	$(".player1Field").append(getCardId);
	$("#"+selectedCard+"").prop("onclick", null);
	$("#"+selectedCard+"").attr("onclick", "selectOnField(this.id)");

		for (var i=0; i<player1.cardsInHand.length; i++) {
			if (player1.cardsInHand[i].cardId === selectedCard) {
				player1.cardsInPlay.push(player1.cardsInHand[i]); //push card to inPlay array
				player1.cardsInHand.splice(i, 1); //splice out the card
				break;
			}
		}
	}

	//returns {currentCard}, that is being played
	for (var k=0; k<player1.cardsInHand.length; k++) {
		var currentCardId = player1.cardsInHand[k].cardId;
		if (currentCardId === selectedCard) {
			//the card IDs match
			var currentCard = currentCard[k];
			break;
		} else {
			//no match
		}
	}

	if (currentCard.hasOwnProperty("mana")) { //plays a land
		if (!player1.playLand) { //player1.playLand is false
			player1.playLand = true;
			cardToBattlefield();
		}
	} else { //plays a creature
		if (player1.manapool >= currentCard.manaCost) { //enough mana
			player1.manapool -= currentCard.manaCost;
			cardToBattlefield();
			updateTotals();
		}
	}
}

var updateTotals = function() {
	var p1Life = $("#p1Life");
	var p2Life = $("#p2Life");
	var p1Mana = $("#p1Mana");
	var p2Mana = $("#p2Mana");

	p1Life.text(player1.lifeTotal);
	p2Life.text(player2.lifeTotal);
	p1Mana.text(player1.manapool);
	p2Mana.text(player2.manapool);

	if (player2.lifeTotal < 1 || player1.lifeTotal < 1) {
		if (player1.lifeTotal < 1){
			alert("player 2 wins");
		} else {
			alert("player 1 wins")
		}
	}

}

var tapCard = function(classId) {
	var selectedId = $(classId).attr("id");
	//get the cardtype of the card as creature/land
		//returns {currentCard}, that is being played

	var currentObj = findCard(player1.cardsInPlay, selectedId).obj;

	if (currentObj.hasOwnProperty("mana")) { //tapping a land
		if (!($("#" + selectedId + "").hasClass("rotated"))) {
			$("#" + selectedId + "").addClass("rotated");
			player1.manapool++;
			updateTotals();
		} else if ($("#" + selectedId + "").hasClass("rotated")) {
			$("#" + selectedId + "").removeClass("rotated");
			player1.manapool--;
			updateTotals();
		}
	} else { //tapping creature
		if (!($("#" + selectedId + "").hasClass("rotated")) && currentObj.hasSickness === false) { //if does not have class rotated && hasSickness is false
			$("#" + selectedId + "").addClass("rotated");
			currentObj.isTapped = true;

		} else if (!($("#" + selectedId + "").hasClass("rotated"))) {
			alert("Creature has summoning sickness!")

		} else if ($("#" + selectedId + "").hasClass("rotated")) {
			$("#" + selectedId + "").removeClass("rotated");
			currentObj.isTapped = false;
		}
	}
}

//finds the card Obj, enter array (player1.array) to search and cardId,
var findCard = function(array, currentId) {
	for (i=0; i<array.length; i++) {
		var loopCardId = array[i].cardId;
		if (loopCardId === currentId) {
			var currentCard = {
				obj: array[i],
				position: i
			};
			return currentCard;
		}
	}
}

var endTurnFunc = function() {
	if (player1.isTurn === true) {
		player1.isTurn = false;
		player2.isTurn = true;
		$("#messages").text("End player1 turn, player 2 start upkeep");
		player1TurnCount++;
		updateTotals();
		return player2Turn();
	} else {
		player2.isTurn = false;
		player1.isTurn = true; //player1 resets
		player1.manapool = 0;
		player1.playLand = false;
		player1.drewCard = false;
		//untap the creatures
		$(".player1Field").children("div").each(function(){
			if (this.classList.contains("rotated")) {
				this.classList.remove("rotated");
			}
		});
			//remove all summoning sickness from creatures
		$(".player1Field").children("div").each(function(){
			var currCard = findCard(player1.cardsInPlay, this.id).obj;
			if (currCard.hasSickness) {
				currCard.hasSickness = false;
			}
		});
			updateTotals();
			$("#messages").text("End player2 turn, player 1 start upkeep");
	}
}

var drawCard = function(player) {
	if (player === player1) { //drawing a card as player1
		if (player.cardsInHand.length > 7) {
			$("#messages").text("hand size cannot exceed 7 cards");
		} else if (player1.drewCard) {
			$("#messages").text("only one card per turn");
		} else if (!player1.drewCard) {
			player1.drewCard = true;
			var newCard = player.cardsInDeck.shift(); //remove the card and store as newCard
			player.cardsInHand.push(newCard);
			$("#showHand").append("<div class='hasCard highlight' style='background-image: url(img/" + newCard.image +
			")' onclick=select(this.id) id="+ newCard.cardId +"></div>"); //id should equal this.id
		}
	} else { //must be player2
		if (player.cardsInHand.length > 7 && player1TurnCount > 2) {
			console.log("player2 hand size cannot exceed 7 cards");
		} else {
			var newCard = player.cardsInDeck.shift(); //remove the card and store as newCard
			player.cardsInHand.push(newCard);
			$("#messages").text("player 2 drew card");
		}
	}
}

var playLandAI = function() {
	//search hand for land
	for (i=0; i<player2.cardsInHand.length; i++) {
		var currCard = player2.cardsInHand[i];

		if (currCard.hasOwnProperty("mana")) {
			currCard = currCard;
			//remove card from player2.cardsInHand
			player2.cardsInHand.splice(i, 1);
			player2.cardsInPlay.push(currCard);
			player2.playLand = true;
			break;
		}
	}
	//play the land
	$(".player2Field").append("<div class='hasCard highlight' style='background-image: url(img/"+ currCard.image +
			")' id="+ currCard.cardId +"></div>");
}

var removeSickness = function() {
	for (i=0; i<player2.cardsInPlay.length; i++) {
		if (!player2.cardsInPlay[i].hasOwnProperty("mana")) {
			player2.cardsInPlay[i].hasSickness = false;
		}
	}
}

var attackFunc = function(classId) {
	var selectedId = $(classId).attr("id"); //gets id of selected card when Attack is hit
	var currentObj = findCard(player1.cardsInPlay, selectedId).obj;

	if ($("#"+selectedId+"").hasClass("rotated") && !currentObj.hasOwnProperty("mana")) {
		$("#messages").text("attacked with " + currentObj.name);
		attack(currentObj);
	} else {
		$("#messages").text("tap before attacking");
	}
}

var attack = function(player) {
//the function is called attack, attacking player is put in as parameter
	//determine if the other player has blockers/which creatures are eligible to block
	//determine which creatures are eligible to attack

	var attackingPlayer = player1;
	var defendingPlayer = player2;
	var possibleAttackers = [];
	var possibleBlockers = [];
	var attackingCreature;
	var blockingCreature;
		//there are two creatures, attackingCreature and blockingCreature.
	var attackingCreaturePos;
	var blockingCreaturePos;

	if (player === player1) {
		attackingPlayer = player1;
		defendingPlayer = player2;
	} else {
		attackingPlayer = player2;
		defendingPlayer = player1;
	}

	//finding attackers/blockers
	for (i=0; i<attackingPlayer.cardsInPlay.length; i++) {
		if (!attackingPlayer.cardsInPlay[i].hasOwnProperty("mana") && !attackingPlayer.cardsInPlay[i].hasSickness) {
			possibleAttackers.push(attackingPlayer.cardsInPlay[i]); //store all possible attackers in here
			console.log(possibleAttackers);
		}
	}

	//Do the same as above with the defending creatures
	for (j=0; j<defendingPlayer.cardsInPlay.length; j++) {
		if (!defendingPlayer.cardsInPlay[j].hasOwnProperty("mana")) { //if card isn't a land and it doesn't have summoning sickness
			possibleBlockers.push(defendingPlayer.cardsInPlay[j]); //store all possible attackers in here
			console.log(possibleBlockers);
		}
	}

	//selecting a random creature from attackers/blockers
	if (possibleAttackers.length > 1 && possibleBlockers.length > 1) {
		var rand1 = Math.floor(Math.random()*possibleAttackers.length);
		attackingCreature = possibleAttackers[rand1];
		var rand2 = Math.floor(Math.random()*possibleBlockers.length);
		blockingCreature = possibleBlockers[rand2];

		console.log(rand1, attackingCreature, rand2, blockingCreature)

	} else if (possibleAttackers.length === 1 && possibleBlockers.length === 1) {
		attackingCreature = possibleAttackers[0];
		blockingCreature = possibleBlockers[0];

		console.log(attackingCreature, blockingCreature)

	} else if (possibleAttackers.length > 1 && possibleBlockers.length === 1) {
		var rand1 = Math.floor(Math.random()*possibleAttackers.length);
		attackingCreature = possibleAttackers[rand1];
		blockingCreature = possibleBlockers[0];

		console.log(rand1, attackingCreature, blockingCreature)

	} else if (possibleAttackers.length === 1 && possibleBlockers.length > 1) {
		attackingCreature = possibleAttackers[0];
		var rand2 = Math.floor(Math.random()*possibleBlockers.length);
		blockingCreature = possibleBlockers[rand2];

		console.log(attackingCreature, rand2, blockingCreature)

	} else {
		var rand1 = Math.floor(Math.random()*possibleAttackers.length);
		attackingCreature = possibleAttackers[rand1];

		var rand2 = Math.floor(Math.random()*possibleBlockers.length);
		blockingCreature = possibleBlockers[rand2];
	}

	if (possibleAttackers.length < 1) {
		//no attacking because there are no creatures
	} else if (possibleAttackers.length > 0 && possibleBlockers.length === 0) {
		//choose one of the possible attackers and deal that damage directly to the defending player
		defendingPlayer.lifeTotal -= attackingCreature.power;
		$("#messages").text("No blockers, damage to player!");
		updateTotals();
	} else {
		//combat of creatures
		attackingCreature.toughness -= blockingCreature.power;
		blockingCreature.toughness -= attackingCreature.power;

			//there are two creatures, attackingCreature and blockingCreature.
		attackingCreaturePos = findCard(attackingPlayer.cardsInPlay, attackingCreature.cardId).position;
		blockingCreaturePos = findCard(defendingPlayer.cardsInPlay, blockingCreature.cardId).position;

		console.log("attack/block positions " + attackingCreaturePos + blockingCreaturePos);

		if (attackingCreature.toughness < 1 && blockingCreature.toughness < 1) {
			$("#messages").text("Both creatures die");
			console.log("bothdies");

			//remove creatures from cardArray
			attackingPlayer.cardsInPlay.splice(attackingCreaturePos, 1);
			defendingPlayer.cardsInPlay.splice(blockingCreaturePos, 1);

			//remove cards from DOM
			$("#"+attackingCreature.cardId+"").remove();
			$("#"+blockingCreature.cardId+"").remove();
		} else if (attackingCreature.toughness < 1 && blockingCreature.toughness > 0) {
			$("#messages").text("attacking creature dies");
			console.log("attackerdies");

			//remove creatures from cardArray
			attackingPlayer.cardsInPlay.splice(attackingCreaturePos.cardId, 1);

			//remove cards from DOM
			$("#"+attackingCreature.cardId+"").remove();
		} else if (blockingCreature.toughness < 1 && attackingCreature.toughness > 0) {
			$("#messages").text("Blocking creature die");
			console.log("blockerdies");

			//remove creatures from cardArray
			defendingPlayer.cardsInPlay.splice(blockingCreaturePos.cardId, 1);

			//remove cards from DOM
			$("#"+blockingCreature.cardId+"").remove();
		} else {
			$("#messages").text("???");
		}
	}
}

var playCreatureAI = function() {
	player2.manapool = 0;
	var potentialMana = 0;
	var potentialCreatures = [];

	//weird case where there is no land and a creature card is put onto the battlefield randomly

	for (i=0; i<player2.cardsInPlay.length; i++) { //search cardsInPlay for potential mana
		if (player2.cardsInPlay[i].hasOwnProperty("mana")) {
			var currCardId = player2.cardsInPlay[i].cardId;
			$("#"+currCardId+"").addClass("rotated"); //make sure to untap the lands on every new turn start
			//console.log("found a potential land");
			potentialMana++;
		}
	}

	for (i=0; i<player2.cardsInHand.length; i++) { //search for potential cards
		if (player2.cardsInHand[i].hasOwnProperty("manaCost") && player2.cardsInHand[i].manaCost <= potentialMana) {
			//cool, let's play that card
			var currCard = player2.cardsInHand[i];
			$(".player2Field").append("<div class='hasCard highlight' style='background-image: url(img/"+ currCard.image +
			")' id="+ currCard.cardId +"></div>");
			currCard = player2.cardsInHand.splice(i, 1); //remove card from hand
			player2.cardsInPlay.push(currCard[0]);
			break;
		}
	}
}

var player2Turn = function() {
	//nothing yet, take care of the rest of player1 first
	drawCard(player2);
	playLandAI();
	removeSickness();
	playCreatureAI();
	attack(player2);
	endTurnFunc();

}

var allLands = [{
	name: "Swamp",
	mana: 1,
	image: "swamp.jpg"
},
{
	name: "Plains",
	mana: 1,
	image: "plains.jpg"
},
{
	name: "Forest",
	mana: 1,
	image: "forest.jpg"
},
{
	name: "Mountain",
	mana: 1,
	image: "mountain.jpg"
},
{
	name: "Island",
	mana: 1,
	image: "island.jpg"
}];

var mountain = [{
	name: "Mountain",
	mana: 1,
	image: "mountain.jpg"
}];

var forest = [{
	name: "Forest",
	mana: 1,
	selected: false,
	image: "forest.jpg"
}];



var greenCreatures = [{
	name: "Birds Of Paradise",
	power: 0,
	toughness: 1,
	manaCost: 1,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "birds-of-paradise.jpg",
	selected: false,
	color: "green"
},
{
	name: "Craw Wurm",
	power: 6,
	toughness: 4,
	manaCost: 6,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "craw-wurm.jpg",
	selected: false,
	color: "green"
},
{
	name: "Giant Spider",
	power: 2,
	toughness: 4,
	manaCost: 4,
	hasFlying: false,
	hasReach: true,
	hasSickness: true,
	isTapped: false,
	image: "giant-spider.jpg",
	selected: false,
	color: "green"
},
{
	name: "Grizzly Bears",
	power: 2,
	toughness: 2,
	manaCost: 2,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "grizzly-bears.jpg",
	selected: false,
	color: "green"
},
{
	name: "Ironroot Treefolk",
	power: 3,
	toughness: 5,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "ironroot-treefolk.jpg",
	selected: false,
	color: "green"
},
{
	name: "Obsianus Golem",
	power: 4,
	toughness: 6,
	manaCost: 6,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "obsianus-golem.jpg",
	selected: false,
	color: "colorless"
},
{
	name: "Scryb Sprites",
	power: 1,
	toughness: 1,
	manaCost: 1,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "scryb-sprites.jpg",
	selected: false,
	color: "green"
},
{
	name: "Wall Of Ice",
	power: 0,
	toughness: 7,
	manaCost: 3,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-ice.jpg",
	selected: false,
	color: "green"
},
{
	name: "Wall Of Wood",
	power: 0,
	toughness: 3,
	manaCost: 1,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-wood.jpg",
	selected: false,
	color: "green"
}];

var redCreatures = [{
	name: "Earth Elemental",
	power: 4,
	toughness: 5,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "earth-elemental.jpg",
	color: "red"
},
{
	name: "Fire Elemental",
	power: 5,
	toughness: 4,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "fire-elemental.jpg",
	color: "red"
},
{
	name: "Gray Ogre",
	power: 2,
	toughness: 2,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "gray-ogre.jpg",
	color: "red"
},
{
	name: "Hill Giant",
	power: 3,
	toughness: 3,
	manaCost: 4,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "hill-giant.jpg",
	color: "red"
},
{
	name: "Hurloon Minotaur",
	power: 2,
	toughness: 3,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "hurloon-minotaur.jpg",
	color: "red"
},
{
	name: "Mons's Goblin Raiders",
	power: 1,
	toughness: 1,
	manaCost: 1,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "monss-goblin-raiders.jpg",
	color: "red"
},
{
	name: "Obsianus Golem",
	power: 4,
	toughness: 6,
	manaCost: 6,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "obsianus-golem.jpg",
	color: "colorless"
},
{
	name: "Roc Of Kher Ridges",
	power: 3,
	toughness: 3,
	manaCost: 4,
	hasFlying: true,
	hasSickness: true,
	isTapped: true,
	image: "roc-of-kher-ridges.jpg",
	color: "red"
},
{
	name: "Wall Of Stone",
	power: 0,
	toughness: 8,
	manaCost: 3,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-stone.jpg",
	color: "red"
}];

var allCreatures = [{
	name: "Air Elemental",
	power: 4,
	toughness: 4,
	manaCost: 5,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "air-elemental.jpg",
	color: "blue"
},
{
	name: "Birds Of Paradise",
	power: 0,
	toughness: 1,
	manaCost: 1,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "birds-of-paradise.jpg",
	color: "green"
},
{
	name: "Craw Wurm",
	power: 6,
	toughness: 4,
	manaCost: 6,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "craw-wurm.jpg",
	color: "green"
},
{
	name: "Earth Elemental",
	power: 4,
	toughness: 5,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "earth-elemental.jpg",
	color: "red"
},
{
	name: "Fire Elemental",
	power: 5,
	toughness: 4,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "fire-elemental.jpg",
	color: "red"
},
{
	name: "Giant Spider",
	power: 2,
	toughness: 4,
	manaCost: 4,
	hasFlying: false,
	hasReach: true,
	hasSickness: true,
	isTapped: false,
	image: "giant-spider.jpg",
	color: "green"
},
{
	name: "Gray Ogre",
	power: 2,
	toughness: 2,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "gray-ogre.jpg",
	color: "red"
},
{
	name: "Grizzly Bears",
	power: 2,
	toughness: 2,
	manaCost: 2,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "grizzly-bears.jpg",
	color: "green"
},
{
	name: "Hill Giant",
	power: 3,
	toughness: 3,
	manaCost: 4,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "hill-giant.jpg",
	color: "red"
},
{
	name: "Hurloon Minotaur",
	power: 2,
	toughness: 3,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "hurloon-minotaur.jpg",
	color: "red"
},
{
	name: "Ironroot Treefolk",
	power: 3,
	toughness: 5,
	manaCost: 5,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "ironroot-treefolk.jpg",
	color: "green"
},
{
	name: "Mahamoti Djinn",
	power: 5,
	toughness: 6,
	manaCost: 6,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "mahamoti-djinn.jpg",
	color: "blue"
},
{
	name: "Merfolk Of The Pearl Trident",
	power: 1,
	toughness: 1,
	manaCost: 1,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "merfolk-of-the-pearl-trident.jpg",
	color: "blue"
},
{
	name: "Mons's Goblin Raiders",
	power: 1,
	toughness: 1,
	manaCost: 1,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "monss-goblin-raiders.jpg",
	color: "red"
},
{
	name: "Obsianus Golem",
	power: 4,
	toughness: 6,
	manaCost: 6,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "obsianus-golem.jpg",
	color: "colorless"
},
{
	name: "Pearled Unicorn",
	power: 2,
	toughness: 2,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "pearled-unicorn.jpg",
	color: "white"
},
{
	name: "Phantom Monster",
	power: 3,
	toughness: 3,
	manaCost: 4,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "phantom-monster.jpg",
	color: "blue"
},
{
	name: "Roc Of Kher Ridges",
	power: 3,
	toughness: 3,
	manaCost: 4,
	hasFlying: true,
	hasSickness: true,
	isTapped: true,
	image: "roc-of-kher-ridges.jpg",
	color: "red"
},
{
	name: "Savannah Lions",
	power: 2,
	toughness: 1,
	manaCost: 1,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "savannah-lions.jpg",
	color: "white"
},
{
	name: "Scathe Zombies",
	power: 2,
	toughness: 2,
	manaCost: 3,
	hasFlying: false,
	hasSickness: true,
	isTapped: false,
	image: "scathe-zombies.jpg",
	color: "black"
},
{
	name: "Scryb Sprites",
	power: 1,
	toughness: 1,
	manaCost: 1,
	hasFlying: true,
	hasSickness: true,
	isTapped: false,
	image: "scryb-sprites.jpg",
	color: "green"
},
{
	name: "Serra Angel",
	power: 4,
	toughness: 4,
	manaCost: 5,
	hasFlying: true,
	hasDefender: false,
	hasVigilance: true,
	hasSickness: true,
	isTapped: false,
	image: "serra-angel.jpg",
	color: "white"
},
{
	name: "Wall Of Air",
	power: 1,
	toughness: 5,
	manaCost: 3,
	hasFlying: true,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-air.jpg",
	color: "blue"
},
{
	name: "Wall Of Ice",
	power: 0,
	toughness: 7,
	manaCost: 3,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-ice.jpg",
	color: "green"
},
{
	name: "Wall Of Stone",
	power: 0,
	toughness: 8,
	manaCost: 3,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-stone.jpg",
	color: "red"
},
{
	name: "Wall Of Swords",
	power: 3,
	toughness: 5,
	manaCost: 4,
	hasFlying: true,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-swords.jpg",
	color: "white"
},
{
	name: "Wall Of Wood",
	power: 0,
	toughness: 3,
	manaCost: 1,
	hasFlying: false,
	hasDefender: true,
	hasSickness: true,
	isTapped: false,
	image: "wall-of-wood.jpg",
	color: "green"
},
{
	name: "Water Elemental",
	power: 5,
	toughness: 4,
	manaCost: 5,
	hasFlying: false,
	hasDefender: false,
	hasSickness: true,
	isTapped: false,
	image: "water-elemental.jpg",
	color: "blue"
}];

generateDecks();
generateHands();
displayHand();

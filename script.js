/**
 * @param {String} ident Just a Number to be able to differ between multiple Weapon Profiles. 
 * Every field has the same name, except for that Ident Number at the end.
 */

function checkFields(ident) {
    if (
        document.getElementById('inAttack' + ident).value == '' ||
        document.getElementById('inHitRoll' + ident).value == '' ||
        document.getElementById('inStrength' + ident).value == '' ||
        document.getElementById('inTough' + ident).value == '' ||
        document.getElementById('inAP' + ident).value == '' ||
        document.getElementById('inSV' + ident).value == '' ||
        document.getElementById('inWoundChar' + ident).value == ''
    ) {
        alert('Bitte fülle alle Felder aus!')
    } else {
        if (
            document.getElementById('inAttack' + ident).value < 0 ||
            document.getElementById('inHitRoll' + ident).value < 0 ||
            document.getElementById('inStrength' + ident).value < 0 ||
            document.getElementById('inTough' + ident).value < 0 ||
            document.getElementById('inSV' + ident).value < 0 ||
            document.getElementById('inWoundChar' + ident).value < 0
        ) {
            alert('Mit positiven Werten kommen realistischere Ergebnisse.')
        }
        if (document.getElementById('inAttack' + ident).value < 0) { document.getElementById('inAttack' + ident).value = 1 };
        if (document.getElementById('inHitRoll' + ident).value <= 0) { document.getElementById('inHitRoll' + ident).value = 1 };
        if (document.getElementById('sustainedHitsNumber' + ident).value <= 0 || document.getElementById('sustainedHitsNumber' + ident).value == "") { document.getElementById('sustainedHitsNumber' + ident).value = 0 };
        calculate(ident);
    }
}

/**
 * Main Calculate function
 * @param {Number} ident We have multiple plattforms for the calculations. 
 * To always use the correct numbers for the questioned Calculation, we use a Number identificator.
 */
function calculate(ident) {
    let lethalHitsBool = document.getElementById('lethalHitsCheck' + ident).checked;
    let devastatingWoundsBool = document.getElementById('devastatingWoundsCheck' + ident).checked;
    let sustainedHitsX = document.getElementById('sustainedHitsNumber' + ident).value;

    let hits = Number(getHittingAttacks(ident));
    let lethalHitWounds = 0;
    let sustainedHits = 0;

    if (sustainedHitsX > 0) {
        sustainedHits = getOneOf6FromHits(hits, ident) * sustainedHitsX
    }

    if (lethalHitsBool) {
        lethalHitWounds = getOneOf6FromHits(hits, ident);
        hits = hits - lethalHitWounds;
    }



    let woundingAttacks = Number(getWounding(hits + sustainedHits, ident));

    let mortalWounds = 0;
    let mortalWoundsDamage = 0;
    if (devastatingWoundsBool) {
        mortalWounds = getMortalWounds(woundingAttacks, ident);
        woundingAttacks = woundingAttacks - mortalWounds;
        mortalWoundsDamage = calculateMortalWoundsDamage(mortalWounds, ident);
    }

    woundingAttacks = woundingAttacks + lethalHitWounds;

    let woundsAttacks = calculateDamage(woundingAttacks, ident);


    finalWords(woundsAttacks, ident, mortalWoundsDamage);
}

/**
 * Errechnet die statistische Anzahl der Erfolge.
 * @param {Number} succRoll Dieser Wert muss erreicht werden, damit der Wurf als Erfolgreich gilt
 * @returns {Number} Errechnete Wahrscheinlichkeit eines Erfolgs
 */
function calculateSuccesses(succRoll) {
    let result = (7 - succRoll) / 6;
    return result
}

/**
 * Errechnet die Wahrscheinlichkeit eines Fehlschlages
 * @param {Number} succRoll Höhe des Erfolgswurfs
* @returns {Number} Errechnete Wahrscheinlichkeit eines Fehlschlages
 */
function calculateFailure(succRoll) {
    return (succRoll - 1) / 6
}

/**
 * Calculates amount of 6 within successfull dice rolls. wounds the attack does. (Or Lethal hits, or other stuff that only happens on 6es)
 * How: We check the proportion of how many of the succesfull wounds are triggering ones. 
 * 
 * Example in wound roll: If we wound on a 4, have 3 Successfull wounds and do devastating Wounds on a 6, we calculate: 
 * (1 / (7-4)) * 3 
 * 1/3 * 3
 * 1 Devastating Wound, because only one of them is (Statistically) a critical wound (with a 6).
 * @param {Number} neededDiceValue The Value a dice needs to show, to count as "successfull" (for example: the BS)
 * @param {Number} amountOfSuccessfullDice Amount of the dice, that (statistically) succeeded the roll.
 * @returns {Number} Amount of 6es that we get statistically within the successfull rolls.
 */
function calculateOneOf6(neededDiceValue, amountOfSuccessfullDice) {
    return ((1 / (7 - neededDiceValue)) * amountOfSuccessfullDice);
}

/**
 * Errechnet die Wahrscheinlichkeit eines Erfolges, wenn bei Misserfolg erneut gewürfelt werden darf!
 * @param {Number} succRoll  Höhe des Erfolgswurfes
 * @returns {Number} Wahrscheinlichkeit des Erfolges (Mit reroll!)
 */
function calculateSuccessWithRerolls(succRoll) {
    let successesChance = calculateSuccesses(succRoll);
    let failChance = calculateFailure(succRoll);
    return successesChance + failChance * successesChance;
}

/**
 * Errechnet die Wahrscheinliche Anzahl der Treffer, indem die Angriffe mit der Wahrscheinlichkeit des Erfolgs multipliziert werden
 * @param {String} ident Wichtig um das richtige Feld abzufragen
 * @returns {Number} Anzahl der Treffer
 */
function getHittingAttacks(ident) {
    let attacks = Number(document.getElementById('inAttack' + ident).value);
    let hitRoll = Number(document.getElementById('inHitRoll' + ident).value);
    let hitRollReroll = document.getElementById('hitRollReroll' + ident);
    let hitRollFracture;

    if (!hitRollReroll.checked) {
        hitRollFracture = Number(calculateSuccesses(hitRoll));
    } else if (hitRollReroll.checked) {
        hitRollFracture = Number(calculateSuccessWithRerolls(hitRoll));
    }

    return attacks * hitRollFracture
}

function getWounding(hits, ident) {

    let wundRollReroll = document.getElementById('woundReroll' + ident);

    let woundRoll = Number(getWoundRoll(ident));
    let woundFactor;

    if (!wundRollReroll.checked) {
        woundFactor = Number(calculateSuccesses(woundRoll));
    } else if (wundRollReroll.checked) {
        woundFactor = Number(calculateSuccessWithRerolls(woundRoll));
    }

    return hits * woundFactor;
}

/**
 * Calculates the Wound Roll
 * @param {String} ident Wichtig um das richtige Feld abzufragen

 * @returns {Number} Number to hit for successfull wound
 */
function getWoundRoll(ident) {
    let strength = Number(document.getElementById('inStrength' + ident).value);
    let toughness = Number(document.getElementById('inTough' + ident).value);

    if (strength == toughness) {
        return 4;
    } else if (strength > toughness) {
        if (strength >= (toughness * 2)) {
            return 2;
        } else {
            return 3;
        }
    } else if (strength < toughness) {
        if ((strength * 2) <= toughness) {
            return 6;
        } else {
            return 5;
        };
    };
};


/**
 * Gets amount on lethal hits
 * @param {Number} hits Amount of successfull hitting dices
 * @param {String} ident Identificator
 * @returns 
 */
function getOneOf6FromHits(hits, ident) {
    let hitRoll = Number(document.getElementById('inHitRoll' + ident).value);
    return calculateOneOf6(hitRoll, hits);
}


/**
 * Calculates amount of Devastating wounds the attack does.
 * How: We check the proportion of how many of the succesfull wounds are devastating ones. 
 * Example: If we wound on a 4, have 3 Successfull wounds and do devastating Wounds on a 6, we calculate: 
 * (1 / (7-4)) * 3 
 * 1/3 * 3
 * 1 Devastating Wound, because only one of them is (Statistically) a critical wound (with a 6).
 * @param {*} woundingAttacks 
 * @param {*} ident 
 * @param {*} antiValue 
 * @returns 
 */
function getMortalWounds(woundingAttacks, ident, antiValue) {

    let woundRoll = getWoundRoll(ident);

    if (!antiValue) {
        return calculateOneOf6(woundRoll, woundingAttacks)

    } else {
        if (antiValue < 0) { antiValue = antiValue * (-1) };
        alert("Anti-X is not implemented now!")
    }
}

/**
 * Calculates amount of damage, the devastating wounds do
 * @param {Number} mortalWounds 
 * @returns {NUmber} Amount of damage
 */
function calculateMortalWoundsDamage(mortalWounds, ident) {
    let woundCharachteristic = Number(document.getElementById('inWoundChar' + ident).value);
    return Number(mortalWounds * woundCharachteristic);
}

/**
 * 
 * @param {Number} woundingAttacks 
 * @param {String} ident Identifier Number, can be empty
 * @param {Number} mortalWounds amount of Mortal Wounds
 * @returns {Array}
 */
function calculateDamage(woundingAttacks, ident) {
    let armourPenetration = getAP(ident)
    let saveUnit = Number(document.getElementById('inSV' + ident).value)
    let woundCharachteristic = Number(document.getElementById('inWoundChar' + ident).value)

    let realSV = saveUnit + armourPenetration

    if (realSV > 6) {
        return [((woundingAttacks) * woundCharachteristic).toFixed(2), woundingAttacks.toFixed(2)]
    } else {

        let damageDealingAttacks = Number((woundingAttacks * (1 - calculateSuccesses(realSV))).toFixed(2));
        let damageDealt = ((damageDealingAttacks) * woundCharachteristic).toFixed(2)

        return [damageDealt, damageDealingAttacks]
    }
}

function getAP(ident) {
    let armourPenetration = Number(document.getElementById('inAP' + ident).value)
    if (armourPenetration < 0) {
        armourPenetration = armourPenetration * (-1)
    }
    return armourPenetration
}

/**
 * Creating a nice text out of all the math back here
 * @param {*} woundsAttacks 
 * @param {*} ident 
 * @param {*} mortalWounds 
 */
function finalWords(woundsAttacks, ident, mortalWounds) {

    if (typeof (woundsAttacks) == "string") { woundsAttacks = woundsAttacks.split(",") };

    let woundText = Number(Number(woundsAttacks[0]) + Number(mortalWounds)).toFixed(2) + ' Wunden,  ';
    let attacksText = 'in ' + woundsAttacks[1] + ' Angriffen.';
    let mortalWoundsText = "";
    if (woundsAttacks[0] == 1 && mortalWounds == 0) {
        woundText = '1 Wunde am Ziel,  '
    }
    if (woundsAttacks[1] == 1) {
        attacksText = 'mit einem Angriff.'
    }
    if (mortalWounds) {
        mortalWoundsText = ' <br>Davon entstehen ' + Number(woundsAttacks[0]) + ' durch normale Angriffe, ' + Number(mortalWounds).toFixed(2) + ' durch tödliche Wunden.'
    }

    document.getElementById('resultTag' + ident).innerHTML = 'Der Angriff verursacht statistisch ' + woundText + attacksText + mortalWoundsText;
}

function reset(ident) {
    document.getElementById('inAttack' + ident).value = '';
    document.getElementById('inHitRoll' + ident).value = '';
    document.getElementById('inStrength' + ident).value = '';
    document.getElementById('inTough' + ident).value = '';
    document.getElementById('inAP' + ident).value = '';
    document.getElementById('inSV' + ident).value = '';
    document.getElementById('inWoundChar' + ident).value = '';
}
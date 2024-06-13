const charStats = require('../briv.json');

const express = require('express');
const app = express();

const server = app.listen(3000, () => {
    console.log('Server running on port 3000');
});
app.use(express.json());

app.get('/', (req, res) => {
    res.json({'message': 'Hello Wizards!'});
})

// GET STATS
app.get('/stats', (req, res) => {
    res.json({'message': charStats});
})

// ADD HP, handles temp hp
app.post('/addhp', (req, res) => {
    const { healingAmt, tempHpAmt } = req.body;

    // checking validity of additional hp
    if((!healingAmt || isNaN(healingAmt)) && (!tempHpAmt || isNaN(tempHpAmt))) {
        return res.status(400).json({error: 'Amount must be a number larger than 0'});
    }

    // will heal player to max hp only
    charStats.hitPoints = healingAmt ? Math.min(charStats.maxHitPoints, charStats.hitPoints + healingAmt) : charStats.hitPoints;

    // will add temp hp only if the additional temp hp is greater than the existing temp hp
    charStats.temporaryHitPoints = tempHpAmt ? Math.max(charStats.temporaryHitPoints, tempHpAmt) : charStats.temporaryHitPoints;

    res.json(charStats);
});

// REMOVE HP, with type dependancies, handles temp hp
app.post('/removehp', (req, res) => {
    const { damageType, damageAmt } = req.body;

    // error handling
    if(!damageAmt || isNaN(damageAmt)) {
        return res.status(400).json({error: 'Amount must be a number larger than 0'});
    }

    if(!damageType) {
        return res.status(400).json({error: 'Must include damage type'});
    }

    // first check for player immunities / resistances
    const resistance = charStats.defenses.find(defense => defense.type == damageType)
    // deal damge based on player resistance
    let damage = damageAmt;
    if(resistance) {
        switch(resistance.defense) {
            case 'immunity': 
                damage = 0;
                break;
            case 'resistance':
                damage = Math.ceil(damageAmt / 2);
                break;
        }
    }

    // remove hp from tempHp first 
    if(charStats.temporaryHitPoints > 0) {
        if(charStats.temporaryHitPoints > damage){
            charStats.temporaryHitPoints -= damage;
            damage = 0;
        }
        else {
            damage -= charStats.temporaryHitPoints;
            charStats.temporaryHitPoints = 0;
        }
    }

    charStats.hitPoints -= damage;
    res.json(charStats);
})

module.exports = server;
const app = require('./index.js');
const request = require('supertest');

describe('Player Health Test', () => {
  beforeEach(async () => {
    await request(app).post('/removehp').send({damageAmt: 20, damageType: 'poison'})
    await request(app).post('/addhp').send({healingAmt: 25, tempHpAmt: 0});
  })

  describe('Get Stats', () => {
      it('should return player stats', async () => {
          const res = await request(app).get('/stats')
          const charStats = res.body.message;
          expect(charStats.name).toEqual('Briv');
          expect(charStats.level).toEqual(5);
          expect(charStats.hitPoints).toEqual(25);
          expect(charStats.classes).toEqual([
              {
              'name':'fighter',
              'hitDiceValue':10,
              'classLevel':5
              }
            ]);
          expect(charStats.stats).toEqual({
              'strength':15,
              'dexterity':12,
              'constitution':14,
              'intelligence':13,
              'wisdom':10,
              'charisma':8
            });
          expect(charStats.items).toEqual([
              {
                'name':'Ioun Stone of Fortitude',
                'modifier':{
                  'affectedObject':'stats',
                  'affectedValue':'constitution',
                  'value':2
                }
              }
            ]);
          expect(charStats.defenses).toEqual([
              {
                'type':'fire',
                'defense':'immunity'
              },
              {
                'type':'slashing',
                'defense':'resistance'
              }
            ]);
      });
  })
  
  describe('Add HP Endpoints', () => {
      it('should not add hp to fully healed player', async () => {
        const res = await request(app)
            .post('/addhp')
            .send({
                healingAmt: 10,
                tempHpAmt: 0,
            });
        expect(res.body.hitPoints).toEqual(25);
        expect(res.body.temporaryHitPoints).toEqual(0);
      });
      it('should add hp up to the max hp of the player', async () => {
        await request(app)
          .post('/removehp')
          .send({
                damageAmt: 10,
                damageType: 'slashing',
            })
        const res = await request(app)
            .post('/addhp')
            .send({
              healingAmt: 20,
              tempHpAmt: 0,
            })
      
        expect(res.body.hitPoints).toEqual(25);
        expect(res.body.temporaryHitPoints).toEqual(0);
      });
      it('should add temp hp', async () => {
        const res = await request(app)
          .post('/addhp')
          .send({
            healingAmt: 0,
            tempHpAmt: 10,
          });
        expect(res.body.hitPoints).toEqual(25);
        expect(res.body.temporaryHitPoints).toEqual(10);
      });
      it('should error if input is invalid', async () => {
        const res = await request(app)
          .post('/addhp')
          .send({
              healingAmt: 0,
          });
        expect(res.error.text).toEqual(`{"error":"Amount must be a number larger than 0"}`);
      });
  });
  
  describe('Remove HP Endpoints', () => {
    it('should not remove hp if the player has immunity to damage type', async() => {
        const res = await request(app)
          .post('/removehp')
          .send({
            damageType: 'fire',
            damageAmt: 10,
          })
  
          expect(res.body.hitPoints).toEqual(25);
    });
    it('should take half damage rounded up if the player has resistance to damage type', async() => {
        const res = await request(app)
          .post('/removehp')
          .send({
            damageType: 'slashing',
            damageAmt: 9,
          })
  
        expect(res.body.hitPoints).toEqual(20);
    });
    it('should remove full damage if the player has no resistances', async() => {
        const res = await request(app)
          .post('/removehp')
          .send({
            damageType: 'piercing',
            damageAmt: 10,
          })
  
        expect(res.body.hitPoints).toEqual(15);
    });
    it('should remove temporary hit points before regular hp', async() => {
      await request(app).post('/addhp').send({healingAmt: 10, tempHpAmt: 5})
      const res = await request(app)
        .post('/removehp')
        .send({
          damageType: 'piercing',
          damageAmt: 10,
        })
      expect(res.body.temporaryHitPoints).toEqual(0);
      expect(res.body.hitPoints).toEqual(20);
    });
    it('should error if input is invalid', async() => {
      const res = await request(app)
        .post('/removehp')
        .send({
            damageAmt: 0,
            damageType: 'slashing',
        });
      expect(res.error.text).toEqual(`{"error":"Amount must be a number larger than 0"}`);
    });
    it('should error if damage type is not included', async() => {
      const res = await request(app)
        .post('/removehp')
        .send({
            damageAmt: 10,
        });
      expect(res.error.text).toEqual(`{"error":"Must include damage type"}`);
    });
  })
})
  
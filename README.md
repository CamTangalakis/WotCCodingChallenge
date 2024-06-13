# WotCCodingChallenge

Hello Wizards! I had lots of fun completing this little coding challenge, and thinking more about how the servers might run at WotC. This api has three main endpoints: to read stats, to add healing or temp hp, and to remove hp. 

Tech Used: Nodejs, Jest

to run, use `node server` in the parent directory
to run tests, use 'npm test' in the parent directory

to get character stats, use '/stats' endpoint
to add hp, use '/addhp' endpoint with {healingAmt and/or tempHpAmt}
to remove hp, use '/removehp' endpoint with {damageAmt and damageType}

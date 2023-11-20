Feudal System

Players can start out as barons (owners of cities or castles)
They can upgrade their status by spending gold and become a Duke, which would rule over more things (gains direct control over buildings)

I would like this to be a complex zombie defense strategy game.

This is a zombie defense map, with actual back and forth between the player and the zombies. Players may temporarily lose towns and may pay a fee to rebuild them before the next wave.

Hordes of Zombies come at night. During the day, you will have sparse amounts of zombies wandering around, but the day time is mostly time for the player to regroup and recover.

Players will have supplies provided each wave. Supplies will be maybe in the form of a cart or pack horse that provides a limited amount of healing to the player's units.
Players can upgrade their supply amounts.  
Or players can upgrade their units armor and weapons or unlock new unit's armor and weapons. These choices need to be big decisions for the player when they should upgrade each. Upgrading the wrong thing at the wrong time can be troublesome and increase
the difficulty of the wave.

Supply routes may also be attacked by zombies. Also small towns are capturable by zombies. These smaller towns, mostly existing to bolster player supplies, may be captured to increase zombie strength. the players must contend which resources are most important to defend and at which times. I guess the player has to decide where they place their troops, as misplacing their troops can cost them valuable time. Once a town is captured , it cannot be recaptured until the next night/day. So it makes it
more important to choose which ought to be defended.

I guess the capture of towns/forts will gradually increase the power of players.

Maybe some towns can be neutral until purchased by the player or brought under the control of their realm. Being neutral means the player's wont get supplies, however the zombies can still attack these neutral towns and bolster their forces.

Depending on whether zombies capture towns or forts will determine which units may be added to zombie spawns or how many zombies will be added.

Players can also build outlooks that can provide them with vision(intel) so they can better prepare or when the battle starts, they can react faster!

====Towns===
Towns - Some towns will provide supplies, some will provide gold. Maybe players can upgrade towns they do have, but it's better to have more towns rather than upgraded towns, so its more like a compromise if you don't think you can defend towns further away.
Some towns should also provide unique upgrades, like fire attack/defend or flaming arrows. Which makes some towns more valuable to defend. Players should have to choose which towns they let fall.

Perhaps every town has something unique to offer on top of providing supplies and gold.

What kind of terrain will there be?
There should be forests, mountains, rivers, lakes, valleys. Some areas of the map will provide defensive strategic benefits. Probably mountains.

What is the basic gameplay loop?
Players prepare their forces and survive

What units can they build?
footman, archers, rifleman
rifleman should differ from archers in a significant way so they each have their own role.
The units available depend on the towns they have .
Basic towns can raise basic militia
More advanced towns should provide better units
Players should be able to go over their food limit, but by doing so will cause troops to starve, causing them to lose health at the end of the round.

What are the available heroes?
I guess we start with the basic human heroes, excluding paladin.

What items can they buy?

-   scroll of speed?, some kind of tar traps to slow the advancement of zombies.

What upgrades can they get?

-   armor, weapon, supply upgrades

What kind of enemies will there be?
standard zombies, flying zombies, necromancers, aboms, frost wyrms

Will there be random events? YESSSSS
Some good, some bad. Nothing that can break the game though

What kind of buildings will players be able to build?
towers, barricade? nah, players can upgrade their owned towns.

What are the win and loss conditions?
The loss condition would be losing the final main town in the center

What are the important choices for players to make?

Maybe I'll let the players decide when the next round starts?

<!-- # wc3-ts-template
 An easy to use template to get you started coding in TypeScript for Warcraft III maps.

Setup Guide: [Getting Started](https://cipherxof.github.io/w3ts/docs/getting-started).

## Features
* TypeScript API and wrappers for most handles ([w3ts](https://github.com/cipherxof/w3ts))
* Support for object data manipulation (read/write) ([war3-objectdata](https://github.com/cipherxof/war3-objectdata))
* Evalute code at compile-time and embed the results into your map. ([war3-transformer](https://github.com/cipherxof/war3-transformer))
* Build w3x archives from your project's map folder.
* Work on your map in the World Editor while also coding in TypeScript.
* Automatically create definitions for global variables generated by the World Editor such as regions, cameras, or preplaced units.
* Works on Windows and Mac OS out of the box and with a couple modifications it works on Linux as well. -->

Create a commander system, where you can assign any number of units to a commander and they will copy the basic actions used on him.
You select units, click assign to commander button and select the commander.
Play the error sound if the unit they selected is not a commander , otherwise play success sound.
Hopefully this makes controlling mass units a lot easier.
Perhaps create commander type variants for all the units, when that commander is

Make it so commander types can have an ability players can use that assigns all units of the commander type to follow the commander.

Also have a disjoint ability, that stops associating the units with the commander.

You would also need to check if the units entities are still alive and if not, remove them from the group.

Generals can also have commanders underneath them which they control.

When generals move with their commanders have the commanders and their contingents placed in front of the general.

Commanders and general should have flags attached to their unit model and be a darker shade

if(currentIterationOfGroupUnit){
//proceed to issue that unit an order
}

add tar traps and add ogre mercenaries.

add a command for players to see stats of units by typing -stats, or add that as an ability on units.

===11-4-23 TODO
create a boss that spawns after the round ends? but then he forces it to become night again. Boss name night lord or some cheesy shit like that

Also add a Stone Mason Guild that can repair a destroyed building every night.
Also create a Blacksmith's guild that can create weapons and armors for your heroes, and artifacts too.

Create musketeers, with flaming arrow, should cost 1/5 of their mana to use but can be strong, takes 5 seconds to recharge for another powerful shot. Make it so it get's used every other shot.

Add another neutral kingdom

add -cam commands

add ability to "scout" where the undead will spawn

add the ability for engineers to make camps which will provide supplies to heal units

make the camps retrieve supplies from units that travel from the capital city and to the camps. make it so units can fortify key forts and passages

zombie forces may be increased by a percentage of the players playing.

create item to repair destroyed buildings or make it an ability on a unit

I wonder if I should disable purchasing all stocked units during the night, so players are stuck with their choices they made during the day.

Change the owner of the zombies that are spawned.

=========11-5-23

add food income ability on castle

remove holy light and divine shield,

increase tent building placement size

add a system to ship in armor, weapons and supplies(upgrades)

add system to increase the stock replenish rate of milita

add leaderboard to show stats

make cataphracts

make items for people to buy

add strong orcs to vinidgoths

======== 11-6-23

make some buildings units so you can rotate and style them better

make spell that teleports your units to an area on the map for 20 seconds.

allow players to ship in upgrades, it will cost something every night, players can only ship in one thing at a time. make it be a mule that moves very fucking slow and has to travel far. or maybe add capturable trade posts.

add a way gate portal where if you can defend it for the first 2 nights, it will remain open for you.
Also display some text ont he screen that says primary objective: "Defend the capital city" Secondary Objective: "Defend the portal".

Also add hard and night mare modes; dont add easy mode.

maybe let people upgrade buildings and send a msg of which player upgraded what and then ping on the map

add an ability that guarentees mercenaries for x amount of nights. no cost to your food as well. give them for each player.

we can probably get rid of neutral factions with this change.

also use the centaurs to be raiders.

allow dismount and mount for cavalry units.

make crossing river fords slow the units by 50%; add an invisible caltrop

during the day, I want human players to lead a campaign into undead lands to retake them; and if a town keeps dying over and over again it will be razed to the ground; maybe if you recaptured it and then lose it again, it will be turned into rubble/ruins

just add it to a list of items to be turned into ruins next time they are destroyed

add lumber camps for wood income

Add a disband unit ability with no hotkey which will remove teh unit and refund half the remaining gold if their health is full; add red text and error sound if thats not the case

captured forts and towns will be come spawn locations for zombies

make mules and peasants transport the end of round goods to the capital city.

increase daytime.

add upgrade to increase pack horse speed of those carrying wood, gold, etc

tell players about zombie behvario, which structures they will attack first

====11-8-23
move the spawns closer once the north base has been destroyed. The base has been destroyed, enemies will spawn closer now.

increase stocks available, decrease price a little bit.

add scout tower to the engineer.

make button to rally trained units to hero

make caltops only usable during the day using upgrades

make some rounds have concentrated undead forces and make them stronger instead of increasing numbers.

==== 11-9-23

for spawning less undead, I think I will limit the amount of undead units by some amount, then when any undead units die, i will allow another undead unit to spawn.
but then we need to have a weighted queue of which undead units to spawn, so those most valuable always spawns

add an info ability for supply carrying units

make supply horses walk to the player hero automatically

perhaps I ought to keep the limit to 1000 and look for other ways to increase difficulty.

make a group of death knights attack for some time, then pull back then attack again.

whenever a hero dies an elite unit spawns.

add mines, and maybe other traps for engineers

when a hero dies send the hero as a unit , cycle the abilities and increase the level

on death the unit explodes and reduces the armor of nearby unit

=======

pheonix fire death bolts lol when max mana is reached plus give them mana drain

do a beetle swarm

give supply camp ability to build towers and walls

if you were to make this a base builder then you want to limit the lumber stored for the player.

make the northern fort grant a huge amount of income to make it more valuable and players will defend it more.

also maybe add stealth assassins that meld during the day but cannot do so at night time.

add some invis units as well.

add an ability that spawns a wall

maybe make caltrops do damage as well? could use pehonix fire ability again.

add blink dagger

maybe let players also create their own enemies.

==
display the human and undead casualties at the end of the night

add a soul orb that lets the hero summon a random undead unit?

add soul absorber, something that absorbs the souls of the undead allowing you to gain money, or damage, or maybe buy an upgrade with the souls.

maybe allow undead to be your slaves?

infuse your units with the power of undeath.

give melee heroes 250 attack range against air

perhaps add upgrades that take a 1-3 days to arrive. use upgrades to prevent the purchase of such upgrades like "- Requires Before Night 8"

also maybe add more days with shorter intervals

maybe a form of income could be picking up corpses lol

and then skeletons can counter that by having no corpse so less gold for the player.

add glaives of slaughter item that gives huntress missle art and bounce attack. ranged units only.

making an ability to make heroes jump

====

add an udnead unit that has staacking damage or armor aura

perhaps wood can be used primarily for defenses and gold can be for units and hero items

players need to make use of the existing buildings

=====

players can buy structures from light blue
doing so will mean they get more income for themselves, they also get a personal retinue from their structures every day. lumberjacks(bandits) from lumber mills, angry farmers from the farm, etc.
to enable this feature, add an item to the structures called Purchase Grant, that enables you to purchase structures. Perhaps I will make the northern kingdom owned by the neutral faction instead of it all being owned by the kingdom of hyperion.

When the citadel of the northern knights dies, add undead cavalry to the spawns.

also if a player owns a farm, let them train pigs and chickens for additional income. Can probably just do unit stock so they can only do a limited amount.
perhaps ill let players fight eachother as well. And i don't think I will let the players build additional farms but simply use the ones provided and also make crops buildable only on farm land.

need to make the days longer and also open up 2 spawns every night. but if I go the economic route, I will let players build walls and towers with wood, though the primary defense for players will be from their hero and army.
split the player forces up early.

let players till the land if they want to create more farmland, just change the tile type

// add petrificitaion mirror

make walls take 3 minutes to build but make them strong - this way players arent building walls all willy nilly without thought . make them somewhat expensive to.

caltrops can degrade over time with negative mana regen. once it reaches 0 remove the unit

some heroes are better at killing and some are better for economics

====
TODO make undead structures capturable- make human buildings units too

Fix enkidus spell so it only effects enemies and not buildings too.
need to first check that the units are not from any of the capturable targets
also need to not affect allies

Add more undead unit types

make granary convert to infected granary for undead

make it so player owned farms grant more money

display to the player the gold they get from their owned buildings

perhaps just replace it with circle of power first then have that circle of power upgrade to the correct structure so we dont need to remake everything into a unit

make melee heroes capable of attacking air units

add trigger if an undead unit has order id == 0 meaning they are doing nothing then order them to attack their spawns attack target

close as many gaps as possible for pathing lol

add ability for enkidu to trade health for mana

=====

items - shield that reduces ranged damage to target, costs agility

give heroes custom reinforcements at the capital depending on the hero type

Add heavy cavalry to the northern capital

===

make an ability that has the text from the income report

also next patch add some more enemies in higher tiers and focus on teahcing user

for farmers, let them build a structure then where that unit is placed you add the farm tile. and destroy the unit

add edge map protection so it doesnt crash the game if someone makes unit go outside map bounds.

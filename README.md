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
 -  scroll of speed?, some kind of tar traps to slow the advancement of zombies. 

What upgrades can they get?
 - armor, weapon, supply upgrades 

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
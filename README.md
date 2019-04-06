# screeps AI version 2

After a fist try, I decided to rewrite everything to typescript and with new aproaches by using all the learings of V1
<br/>
this code is hosted at [ChuckInGame (github)](https://github.com/ChuckInGame/screpps)

**Warning: This code is not ready for productive usage**

<br/>
<br/>

-----

## Table of Contents
* [Documentations](#documentation)
* [Inspiration](#inspiration)
* [Code Examples](#code-examples)
* [Tools](#tools)
* [Learings from V1](#learnings-from-v1)
* [Ideas](#ideas)
* [ToDos](#todos)
<br/>
<br/>
-----
## Usage
setup screeps server
> npx screeps init<br/>

configuring password on local server
> http://localhost:21025/authmod/password/
> and configure the pw in screeps.json

compile only <br/>
> rollup -c <br/>

compile und deploy to screeps server<br/>
> rollup -c --environment DEST:main<br/>

compile and deplay to local server<br/>
> rollup -c --environment DEST:pserver<br/>

start local server<br/>
> npx screeps start<br/>

open server CLI<br/>
> npx screeps cli<br/>

## Documentation
- [screeps](https://docs.screeps.com/api/) - the offical screeps documentation
- [lodash](https://lodash.com/docs/4.17.11) - array extensions


## Inspiration

- [Hauling is (NP-)hard](https://bencbartlett.wordpress.com/2018/03/28/screeps-4-hauling-is-np-hard/) - a site that analyse the problem of hauling
- [screeps.fandom.com](https://screeps.fandom.com/wiki/Screeps_Wiki) - a site containing some screep infos
  - [screeps.fandom.com -  movement](https://screeps.fandom.com/wiki/Creep#Movement) - a site that describes the
calulation of creep movements
  - [screeps.fandom.com - tips](https://screeps.fandom.com/wiki/Tips) - some tips
- [Adam Laycook - 22 Parts block](https://arcath.net/articles/screeps) - a block of a guy, implemented screeps AI

- [wiki.screepspl.us](https://wiki.screepspl.us/index.php/Special:AllPages) - a site about screeps
  - [wiki.screepspl.us - harvesting](https://wiki.screepspl.us/index.php/Static_Harvesting) - some usefull harvesting tips
  - [wiki.screepspl.us - level tips](https://wiki.screepspl.us/index.php/Intermediate-level_tips) - a tip collection


## Code Examples
- [GidHub - screeps-movement](https://github.com/trebbettes-screeps/screeps-movement) - a repository contains code for move to  improvements

## Tools
- [body calculator](https://codepen.io/findoff/full/RPmqOd/) - a online calculator for creep costs, movements and others

<br/>
<br/>

-----


## Learings from V1

- **Issue: Worse creep management** - which creeps are reuqired and the upgrade behavior was bad
  - *Miners - layout* - it's unnessasary to have more worker modules on a miner, then the source will produce -> miners ware expensive and are not better then sheaper versions
  - *Haulers* sometimes waiting next to the miner because they haul more energie then the miner can produce
  - *Haulers* sometimes are not able to bring the energie to the targets, because of long pathes
  - *Workers* are there, even if the energie level in the room is low and pulling additional energie out of the room that increases the energie problem

- **Issue: Haulers are dying and the room is dead** - after some time, the haulers diddn't respawn any more or haulers were attecked -> a dead room
  - *Dying because auf low resources* - to much creeps doing thing and uses energie, even if the room has a low energie problem, becaue of  no resource management
  - *No haulers because of resparm issues* - the spawn inplementation sucks
  - *No strategie to secure haulers* - there is no flee or rescure strategie
- **Creeps movings are inefficent** - uncoordinated movings of the creeps are inefficent -> wasting a lot of ticks / energie
  - Every hauler is moving to the span to fill it up, even if the neares could handle it easyly, during this, the creep will waste a lot of ticks / energie
  - haulers are moving long pathes with only a bit energie inside -> painfull, if the creep is moving for examle 80 ticks more or less useless
  - there is no strategie to optimize the pathes, a creep is moving
  - the buffering containers are not placed optimal to reduce the overall movemend ticks required to handle a room
- **High CPU usage** - ok, after the cache implementation it was better, but still, there is a lot of potential to reduce CPU load
  - There are much iterations over arrays
  - during task changes, the calculations of path is excensive

<br/>
<br/>

-----

## Ideas

### Buffering containers
  - until we have no storage, the containers should be near to the spawn, like now
  - after building the storage, i should remove the containers and use them to buffer on hauler pathes to reduce the overall moving ticks of haulers
    * Every tick a hauler is moving empty, before he is dying, he wasted overall ticks in the room
    * Haulers, acting in the near of the spawn and has not so much work to do and now filling up this buffering containers are more efficent

### Resource management
A room component should manage the room energie by
  - allowing spawning creeps or not
  - allowing towers to do none defending operations or not, to avoid wasting energie for repairing structures

This component should:
  - be able to calculate the required energy of a worker-group to know how much energie is required for building the working-group and the workers need to do their jobs over their life time
  - te able to calculate the available free energy in a room
  - be able to to these calculations, by respecting the required other energie consumption and the mining ammount per tick in a room.

### Creep roles

#### **Pioneer**
More or less based on the old *energieDistributor*. Its a fast creep with a WORK part and medium CARRY parts.
Creeps of this role are responsible to build or rebuild a room, after starting a room or after an attack of others.
> * While we have only one room and are higher then Level 3, there should be there at least one of this Pioneer with more then 500 ticks live time, may be working something, but be ready to flee from hostils in other rooms to come back to rebuild the room after the attack
> * After an attack, the count of Pioneers should be increased, because the attackers will come back and we want to be able to survice
> * If we have more then one room, the other room creates at least one Pioneer to help out in the attacked room. In this case, we don't need Pioneers in the system any more

#### **Light Defenders**

Simple two or more initial defender creeps, doing spider rep an rage attack. They are fast and protect the room against initial hostils, comming in a room.
<br />**TODO Spider rep good ???**<br />
In case of NPC, they should normally be able to handle them, but they give the room time to react on the hostils attack, if they are none NPCs, without loosing to much none military creeps.



#### **Worker-Group**
Instead of manager independent workers, the new aproach is a group of workers, including a hauler for the worker, acting as a team.
The **spawn management** should only spawn a hole group, if the **resource management** allows it

### Creep director - Creep task handling
In V1, every creep is working for its own. It's easy, but this is wasting a lot of ticks and energie.<br/>
We need a creeps director that is able to coordinate the creeps with less wasting resources as possible.<br/>
<br/>
The creep director uses role directors, to manage tasks for creeps.

```typescript
if(creeps.tasks.length < 2)
{
  const roleDirector = roleDirectors.Find(creep.Role);
  creep.tasks.Add(roleDirector.CreateTasks(creep));
}
```


### Spawn management
In V1 the spawns are coordinated only by a more or less fix creep count per role. Depending on the room, this works more or less well.
Some times there were to much creeps of a role, wasting energie.

The new spawan implementation should work more dynamicly and efficent.
  - the amount of creeps for a role should be spawnd based on calculated factors and the **Resource Management** to avoid wasting energie for too much creeps are there as really needed
  - stop spawn of not really required creeps during **ROOMMODE_WAR**
  - workers should be managed by a worker-group (including a hauler for the workers). Spawning of worker-groups should depend on the **Resource Management**
    > A worker-group should never reduce a room energy level below a fix threshold
    > * to avoid low energie level
    > * to let the room be able to react on atackers
  - static creeps (like upgraders, miners) should be spawned in time, so that the new creep is on his place, when the old dies.

### Building Defense (Walls / Rampage) around the spawn place to create a bunker around the spawn
a simple aproach:
1. OutPathes -> take pathes from spawn to ever open room entry field
2. group walls into  islands by their neighbour fields
3. IslandPathes-> find all shortes pathes between islands
4. CrossingPathes-> find all IslandPath  crossing a  OutPathes -> select the IslandPath
  - order the CrossingPathes by distance of MIN(cp.Start || cp.End) to make sure, that we first try to build a bunker closely around the spawn
  - then order by CrossingPath length to start with them, we can handle the pathes with less costs first
5. plan for each CrossingPath a bridge of walls / ramparts to close the space
6. calculate new OutPathes by ignoring the planed building pathes
7. repeat Step 2-6 as long outPathes could be calculated successfully


this could be done in multiple steps, by reducing the entry points of the main bunker, until the bunker is surrounded with walls/ramParts<br/>
During this, we reduce the ammount of places we could be attacked without hostils creep can come in without destroying the structure defense.<br/>
During these steps, we are able to place defense creeps on all open wholes between the islands, until we are able to close all<br/>


### Improve the strength of defense
* extend the entry rampPart by one and put a wall right and left to it, so the attackers need to destroy 2 rampParts.
* the secound one make 2 fields wide, to support 2 defense creeps standing next to each other with RANGE_ATTACK.
* So,  a defense ATTACK creep can be at the front, and two RANGE_ATTACK behind him. And then the 5 remote healers with RANGE_HEAL, like a pyramid

<br/>
<br/>

-----

## ToDos
- calculate the cost of Renew creeps and think about a strategie to use it
- find out, if a scout can read out the hostil creep data like
  - Damage taken
  - energie carring
  - parts
- find out, if NPC stations could be destroyed to clean a room from NPCs
- plan scouting strategies
  - which rooms to scout
  - optimizing the Pioneer strategie by using scouts -> when they find a hostil -> pioneer creation ??
  - think about scouting with a remote miner, too not wasting the creep
    - therfore, we need an additional hauler, moving to the remote miner
      - the cost of the hauler should be less then the hauler can carry to home ( or neares energie conume room object) during his live time / renew costs
- find out, if spider rep in a fight is a good idea or not






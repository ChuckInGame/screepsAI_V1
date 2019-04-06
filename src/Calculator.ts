import { List } from 'linqts';

export class Calculator
{

    constructor()
    {
    }

    public CreepWeight(creep: Creep, full: boolean): number
    {
        return this.CreepBodyWeight(creep.body, full);
    }

    public CreepBodyWeight(body: BodyPartDefinition[], full: boolean): number
    {
        const partCount = body.length;
        const moveParts = body.filter((t) => t.type === MOVE).length;
        const carryParts = body.filter((t) => t.type === CARRY).length;
        const fullParts = full ? carryParts : 0;

        return partCount - moveParts - carryParts + fullParts;
    }

    public MovePerTick(creep: Creep)
    {
        const goals = _.map(creep.room.find(FIND_SOURCES), (source: Source) =>
        {
            // We can't actually walk on sources-- set `range` to 1 
            // so we path next to it.
            return { pos: source.pos, range: 1 };
        });

        let ret = PathFinder.search(
            creep.pos, goals,
            {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function (roomName)
                {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since 
                    // PathFinder supports searches which span multiple rooms 
                    // you should be careful!
                    if (!room)
                    {
                        return;
                    }
                    const costs = new PathFinder.CostMatrix();

                    room.find(FIND_STRUCTURES).forEach((struct: Structure) =>
                    {
                        if (struct.structureType === STRUCTURE_ROAD)
                        {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        }
                        else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                                !struct.my))
                        {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });

                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach(function (creep)
                    {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });

                    return costs;
                },
            }
        );


    }

}

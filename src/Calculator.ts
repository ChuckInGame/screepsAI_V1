/// <reference path="../node_modules/@types/screeps/index.d.ts" />

import { openSync } from "fs";




export class Calculator
{
    private isObstacle: any
    constructor()
    {
        this.isObstacle = _.transform(
            OBSTACLE_OBJECT_TYPES,
            (o, type) => { o[type] = true; },
            {}
        );
    }



    private isEnterable(structureType: string)
    {
        return !this.isObstacle[structureType];
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
    }


    public calculateTickCost(startPosition: RoomPosition, body: BodyPartDefinition[], full: boolean, goals: Array<RoomPosition | { pos: RoomPosition; range: number }>): PathFinderPath
    {
        const room = Game.rooms[startPosition.roomName];

        const structures = room.find(FIND_STRUCTURES);
        const roads = structures.filter(t => t.structureType === STRUCTURE_ROAD);
        const nonWalkable = structures.filter(t => !this.isEnterable(t.structureType));


        const partCount = body.length;
        const moveParts = body.filter((t) => t.type === MOVE).length;
        const carryParts = body.filter((t) => t.type === CARRY).length;
        const emptyCarryParts = full ? 0 : carryParts;
        const W = partCount - moveParts - emptyCarryParts;

        /*
            t = ceil(K * W / M)
                Where:
                    t = time (game ticks)
                    K = terrain factor (0.5x for road, 1x for plain, 5x for swamp)
                    W = creep weight (Number of body parts, excluding MOVE and empty CARRY parts)
                    M = number of MOVE parts
        */
        const callback = (roomName: string) =>
        {
            if (roomName !== startPosition.roomName)
            {
                return false;
            }
            const costs = new PathFinder.CostMatrix;

            nonWalkable.forEach(struct =>
            {
                costs.set(struct.pos.x, struct.pos.y, 255); // Can't walk through non-walkable buildings
            });

            roads.forEach(struct =>
            {
                costs.set(struct.pos.x, struct.pos.y, Math.ceil(0.5 * W / moveParts));
            });

            return costs;
        };

        const ret = PathFinder.search(
            startPosition, goals, {
                swampCost: Math.ceil(5 * W / moveParts),
                plainCost: Math.ceil(1 * W / moveParts),
                roomCallback: callback
            });

        return ret;
    }
}

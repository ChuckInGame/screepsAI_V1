import { Calculator } from "Calculator";
import { ErrorMapper } from "utils/ErrorMapper";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() =>
{

  const calc = new Calculator();

  var spawm = Game.spawns['Spawn1'];
  if (!spawm)
    return;

  var room = spawm.room;

  var creeps = room.find(FIND_HOSTILE_CREEPS)
  var first = creeps[0];
  console.log(JSON.stringify(first));

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps)
  {
    if (!(name in Game.creeps))
    {
      delete Memory.creeps[name];
    }
  }
});

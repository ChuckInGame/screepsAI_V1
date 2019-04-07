// example declaration file - remove these and add your own custom typings
/// <reference path="../node_modules/@types/screeps/index.d.ts" />
// memory extension samples
interface CreepMemory
{
  role: string;
  room: string;
  working: boolean;
}

interface Memory
{
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS
{
  interface Global
  {
    log: any;
  }
}

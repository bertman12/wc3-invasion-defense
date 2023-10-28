import { Rectangle, Unit } from "w3ts";
import { OrderId, Players } from "w3ts/globals";
// import { Units } from "war3-objectdata-th";

export function zombieSpawn() {
    print("The first round has started!");
    let r = Rect(0,0,0,0)
    const zSpawn = Rectangle.fromHandle(gg_rct_ZombieSpawn1);
    
    let u = Unit.create(Players[12], FourCC("nzom"), zSpawn?.centerX ?? 0, zSpawn?.centerY ?? 0, 0);
    u?.issueOrderAt(OrderId.Attack, 0, 0);
    
}


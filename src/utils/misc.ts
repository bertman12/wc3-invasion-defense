
type ProperColors = 
    | "goldenrod"  
    | "gold"
    | "green"
    | "yellow"
    | "red"

export function tColor(text: string, color?: ProperColors, hex?:string, alpha?: string){
    
    if(color){
        return `|cff${properColorHexes.get(color) || "FFFFFF"}${alpha || ""}${text}|r`;
    }
    else if(hex){
        return `|cff${hex}${alpha || ""}${text}|r`;
    }

    return text;
}

const properColorHexes = new Map<ProperColors, string>([
    ["goldenrod", "E0A526"],
    ["green", "00FF00"],
    ["yellow", "FFFF00"],
    ["red", "FF0000"],
]);

export function notifyPlayer(msg: string){
    print(`${tColor("!", "goldenrod")} - ${msg}`);
}

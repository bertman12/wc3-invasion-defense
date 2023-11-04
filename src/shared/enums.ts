
export enum ABILITIES {
    charge = FourCC("A005"),
    supplies = FourCC("A000"),
    income = FourCC("A002"),
    armorUpgrade = FourCC("A006"),
    weaponUpgrade = FourCC("A007"),
}

export enum UpgradeCodes {
    armor = FourCC("Rhar"),
    meleeWeapons = FourCC("Rhme"),
    supplyUpgrade = FourCC("R000"),
}

export enum CUSTOM_UNITS {
    farmTown = FourCC("h002"),
    castle = FourCC("hcas"),
    barracks = FourCC("hbar"),
    blacksmith = FourCC("hbla"),
    cannonTower = FourCC("hctw"),
    guardTower = FourCC("hgtw"),
}
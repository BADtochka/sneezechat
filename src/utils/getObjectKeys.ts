export const getObjectKeys = <T extends {}>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[];

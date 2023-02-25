import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class ShipmentStatus {

    @PrimaryKey()
    id!: number;

    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'string' })
    description!: string;
}

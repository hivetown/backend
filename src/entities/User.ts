import { Entity, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class User {

    @Property()
    name!: string;

    @Property()
    email!: string;

    @Property({ type: 'numeric' })
    phone!: number;

    @Property({ type: 'numeric', unique: true })
    vat!: number;
}

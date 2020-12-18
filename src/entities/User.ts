import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity() // database table
export class User {

  @Field(() => Number)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: 'date'}) // table column
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() }) // hook that creates new date every time you update
  updatedAt = new Date();

  @Field(() => String)
  @Property({type: 'text', unique: true})
  username!: string;

  // without a @Field, you cannot select it in the graphql, which makes sense since it is confidential
  @Property({type: 'text'})
  password!: string;
}
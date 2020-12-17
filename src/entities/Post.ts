import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity() // database table
export class Post {

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
  @Property({type: 'text'})
  title!: string;

}
import {Field, ObjectType} from 'type-graphql';
import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@ObjectType()
@Entity() // database table
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn() // table column
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn() // hook that creates new date every time you update
  updatedAt = Date;

  @Field(() => String)
  @Column()
  title!: string;
}

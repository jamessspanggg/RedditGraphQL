import {Field, ObjectType} from 'type-graphql';
import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@ObjectType()
@Entity() // database table
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn() // table column
  createdAt = Date;

  @Field(() => String)
  @UpdateDateColumn() // hook that creates new date every time you update
  updatedAt = Date;

  @Field()
  @Column({unique: true})
  username!: string;

  @Field()
  @Column({unique: true})
  email!: string;

  // without a @Field, you cannot select it in the graphql, which makes sense since it is confidential
  @Column()
  password!: string;
}

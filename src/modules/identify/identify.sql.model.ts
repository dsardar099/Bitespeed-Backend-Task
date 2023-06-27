import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

@Table({ paranoid: true, modelName: 'Contact' })
export class Identify extends Model {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  phoneNumber: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  email: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Identify)
  linkedId: number;

  @AllowNull(false)
  @Column(DataType.ENUM('secondary', 'primary'))
  linkPrecedence: 'secondary' | 'primary';
}

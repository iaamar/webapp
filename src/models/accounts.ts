// src/models/account.ts
import { DataTypes, Model, Sequelize } from "sequelize";

export class Account extends Model {
  public id!: number;
  public email!: string;
  public password!: string;

  // Define timestamps fields (optional)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initAccountModel = (sequelize: Sequelize) => {
  Account.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      password: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
    },
    {
      tableName: "accounts",
      sequelize, // passing the `sequelize` instance is required
    }
  );
};

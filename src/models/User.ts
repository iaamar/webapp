import { DataTypes, Model, Sequelize } from "sequelize";

// User model definition
export class User extends Model {
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public password!: string;
  public email!: string;
  public email_verified!: boolean;
  public account_created!: Date;
  public account_updated!: Date;
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      account_created: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      account_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
    },
    {
      tableName: "users",
      sequelize, // Pass the Sequelize instance
      timestamps: false, // Sequelize will not automatically add `createdAt` and `updatedAt`
    }
  );
};

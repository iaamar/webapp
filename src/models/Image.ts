import { DataTypes, Model, Sequelize } from "sequelize";

export class Image extends Model {
  public id!: string;
  public file_name!: string;
  public url!: string;
  public upload_date!: Date;
  public user_id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initImageModel = (sequelize: Sequelize) => {
  Image.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      upload_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "images",
      sequelize, // Pass the Sequelize instance
      timestamps: false, // Skip automatic timestamps
    }
  );
};

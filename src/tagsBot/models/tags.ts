import { Sequelize, DataTypes, Model } from "sequelize";

const sequelize = new Sequelize({
  dialect: "sqlite",
  host: "localhost",
  logging: true,
  storage: "database.sqlite",
});

class Tag extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public username!: string;
  public usageCount!: number;
}

Tag.init(
  {
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    description: DataTypes.TEXT,
    username: DataTypes.STRING,
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "tags",
  },
);

export { sequelize, Tag };

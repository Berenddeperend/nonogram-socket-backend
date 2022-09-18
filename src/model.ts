const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

path.resolve(__dirname, "../dev.sqlite3");
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.resolve(__dirname, "./../db/test.sqlite"),
  // storage: "./../db/test.sqlite",
});

export const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export const Puzzle = sequelize.define("Puzzle", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  width: {
    type: DataTypes.INTEGER,
    default: 10,
  },
  height: {
    type: DataTypes.INTEGER,
    default: 10,
  },
});

User.Puzzles = User.hasMany(Puzzle, {
  foreignKey: "authorId",
});
Puzzle.User = Puzzle.belongsTo(User, {
  as: "author",
  foreignKey: "authorId",
});

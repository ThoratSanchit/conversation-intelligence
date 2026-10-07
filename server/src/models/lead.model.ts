import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { LeadAttributes } from '../types/lead.types';

export interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  declare id: string;
  declare company_name: string;
  declare website: string | null;
  declare industry: string | null;
  declare location: string | null;
  declare revenue: string | null;
  declare employees: number | null;
  declare year_founded: number | null;
  declare owner_name: string | null;
  declare owner_title: string | null;
  declare email: string | null;
  declare phone: string | null;
  declare linkedin: string | null;
  declare technology: string | null;
  declare headcount_growth: string | null;
  declare open_positions: number | null;
  declare created_at: Date;
  declare updated_at: Date;
}

Lead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    revenue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    year_founded: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    owner_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    owner_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    technology: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headcount_growth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    open_positions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'leads',
    timestamps: true,
    underscored: true,
  }
);

export default Lead;

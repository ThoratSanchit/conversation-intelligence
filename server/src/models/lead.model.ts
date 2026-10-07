import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { LeadAttributes } from '../types/lead.types';

export interface LeadCreationAttributes
  extends Optional<LeadAttributes, 'id' | 'created_at' | 'updated_at'> {}

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
  declare raw_data: Record<string, unknown> | null;
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    revenue: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    owner_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    technology: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    headcount_growth: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    open_positions: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    raw_data: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'leads',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_leads_created_at',
        fields: ['created_at'],
      },
      {
        name: 'idx_leads_company_name',
        fields: ['company_name'],
      },
      {
        name: 'idx_leads_industry',
        fields: ['industry'],
      },
    ],
  }
);

export default Lead;

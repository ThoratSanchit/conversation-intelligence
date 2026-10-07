import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import {
  DetectedSignal,
  IntelligenceStatus,
  LeadIntelligenceAttributes,
} from '../types/intelligence.types';

export interface LeadIntelligenceCreationAttributes
  extends Optional<LeadIntelligenceAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class LeadIntelligence
  extends Model<LeadIntelligenceAttributes, LeadIntelligenceCreationAttributes>
  implements LeadIntelligenceAttributes
{
  declare id: string;
  declare lead_id: string;
  declare status: IntelligenceStatus;
  declare signals: DetectedSignal[];
  declare why_contact_now: string | null;
  declare why_it_matters: string | null;
  declare conversation_angle: string | null;
  declare suggested_opening: string | null;
  declare error_message: string | null;
  declare created_at: Date;
  declare updated_at: Date;
}

LeadIntelligence.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lead_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'leads',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING',
      allowNull: false,
    },
    signals: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
    why_contact_now: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    why_it_matters: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    conversation_angle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    suggested_opening: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'lead_intelligence',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_lead_intelligence_lead_id_unique',
        unique: true,
        fields: ['lead_id'],
      },
    ],
  }
);

export default LeadIntelligence;

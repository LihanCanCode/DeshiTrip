import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    admin: Types.ObjectId;
    members: Types.ObjectId[];
    guests: {
        name: string;
        addedBy: Types.ObjectId;
    }[];
    inviteCode: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true },
        description: { type: String },
        admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        guests: [
            {
                name: { type: String, required: true },
                addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            },
        ],
        inviteCode: { type: String, unique: true, required: true },
        avatar: { type: String },
    },
    { timestamps: true }
);

export const Group = model<IGroup>('Group', groupSchema);

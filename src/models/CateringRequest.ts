import mongoose, { Schema, Document, models } from 'mongoose';

export interface ICateringRequest extends Document {
    orgName: string;
    repName: string;
    eventDate: string; // ISO or DD/MM/YYYY
    eventTime: string;
    items: string;
    club: string;
    status: string; // 'Pending', 'Accepted', 'Declined'
    surcharge: string;
    daysNotice: number;
    discordClubMessageId?: string;
    discordStaffMessageId?: string;
    createdAt: Date;
    processedBy?: string;
    declineReason?: string;
}

const CateringRequestSchema = new Schema<ICateringRequest>({
    orgName: { type: String, required: true },
    repName: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: false },
    items: { type: String, required: true },
    club: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    surcharge: { type: String, required: false },
    daysNotice: { type: Number, required: false },
    discordClubMessageId: { type: String, required: false },
    discordStaffMessageId: { type: String, required: false },
    processedBy: { type: String, required: false },
    declineReason: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for performance (Free Tier optimization)
CateringRequestSchema.index({ status: 1, createdAt: -1 }); // Dashboard query
CateringRequestSchema.index({ club: 1, status: 1 }); // Filtering by club

export default models.CateringRequest || mongoose.model<ICateringRequest>('CateringRequest', CateringRequestSchema);

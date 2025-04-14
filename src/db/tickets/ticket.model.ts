import mongoose, { Schema, Document } from 'mongoose';
import { TicketStatus } from '../../types/tickets/ticketStatus';
import { ITicket } from '../../types/tickets/ticketDocument';

const TicketSchema: Schema<ITicket> = new mongoose.Schema({
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(TicketStatus),
        default: TicketStatus.New
    },
    resolution: { type: String },
    cancellationReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export const TicketModel = mongoose.model<ITicket & Document>('Ticket', TicketSchema);

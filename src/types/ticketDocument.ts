import {Document} from 'mongoose';
import {TicketStatus} from './ticketStatus';

export interface ITicket extends Document {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    resolution?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
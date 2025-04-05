import { TicketModel } from '../db/tickets/ticket.model';
import { TicketStatus } from '../types/ticketStatus';

export class TicketService {
    static async createTicket(data: { subject: string; description: string }) {
        const ticket = new TicketModel(data);
        await ticket.save();
        return ticket.toObject();
    }

    static async findTicketById(id: string) {
        return TicketModel.findById(id);
    }

    static async updateTickets() {
        return TicketModel.updateMany(
            { status: TicketStatus.InProgress },
            {
                status: TicketStatus.Cancelled,
                cancellationReason: 'All cancel',
                updatedAt: new Date()
            }
        );
    }

    static async getFilteredTickets(query: {
        createdAt?: {
            $gte?: Date;
            $lte?: Date;
        };
    }) {
        return TicketModel.find(query).sort({ createdAt: -1 });
    }
}

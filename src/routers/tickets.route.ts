import { Router } from 'express';
import {
    cancelAllInProgress,
    cancelTicket,
    completeTicket,
    createTicket,
    getAllTickets,
    takeInProgress
} from '../controllers/ticket.controller';
export const TicketsRouter = Router();

TicketsRouter.post('/', createTicket);
TicketsRouter.post('/:id/take', takeInProgress);
TicketsRouter.post('/:id/complete', completeTicket);
TicketsRouter.post('/:id/cancel', cancelTicket);
TicketsRouter.get('/', getAllTickets);
TicketsRouter.post('/cancel-all-in-progress', cancelAllInProgress);


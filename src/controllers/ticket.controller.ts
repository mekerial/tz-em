import express, { Request, Response } from 'express';
import { TicketService } from '../services/ticket.service';
import { TicketStatus } from '../types/tickets/ticketStatus';
import {
    CancelTicketBody,
    CompleteTicketBody,
    CreateTicketBody, GetAllTicketsQuery,
    TicketParams,
    TicketType
} from "../types/tickets/ticketTypes";



export const createTicket = async (
    req: Request<{}, {}, CreateTicketBody>,
    res: Response< TicketType | { message: string }>
) => {
    try {
        const { subject, description } = req.body;

        if (typeof subject !== 'string' || subject.trim() === '') {
            return res.status(400).json({ message: 'Invalid or missing subject' });
        }

        if (typeof description !== 'string' || description.trim() === '') {
            return res.status(400).json({ message: 'Invalid or missing description' });
        }

        const ticket = await TicketService.createTicket({ subject, description });
        return res.status(201).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Request error' });
    }
};

export const takeInProgress = async (
    req: Request<TicketParams>,
    res: Response<TicketType | { message: string }>
): Promise<Response> => {
    try {
        const { id } = req.params;

        const ticket = await TicketService.findTicketById(id);

        if (!ticket) {
            return res.status(400).json({ message: 'Not found' });
        }

        if (ticket.status === TicketStatus.InProgress) {
            return res.status(400).json({ message: 'Status In working' });
        }

        if (ticket.status === TicketStatus.Completed) {
            return res.status(400).json({ message: 'Status already completed' });
        }

        ticket.status = TicketStatus.InProgress;
        ticket.updatedAt = new Date();
        await ticket.save();

        return res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Request error' });
    }
};

export const completeTicket = async (
    req: Request<TicketParams, {}, CompleteTicketBody>,
    res: Response<TicketType | { message: string }>
): Promise<Response> => {
    try {
        const { resolution } = req.body;
        const { id } = req.params;

        if (typeof resolution !== 'string' || resolution.trim() === '') {
            return res.status(400).json({ message: 'Invalid or missing resolution' });
        }

        const ticket = await TicketService.findTicketById(id);

        if (!ticket || ticket.status !== TicketStatus.InProgress) {
            return res.status(400).json({ message: 'The request cannot be completed' });
        }

        ticket.status = TicketStatus.Completed;
        ticket.resolution = resolution;
        ticket.updatedAt = new Date();
        await ticket.save();

        return res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error' });
    }
};


export const cancelTicket = async (
    req: Request<TicketParams, {}, CancelTicketBody>,
    res: Response<TicketType | { message: string }>
) => {
    try {
        const { cancellationReason } = req.body;
        const { id } = req.params;

        if (typeof cancellationReason !== 'string' || cancellationReason.trim() === '') {
            return res.status(400).json({ message: 'Invalid or missing cancellation reason' });
        }

        const ticket = await TicketService.findTicketById(id);

        if (!ticket) {
            return res.status(400).json({ message: 'Not found' });
        }

        if (ticket.status === TicketStatus.Completed || ticket.status === TicketStatus.Cancelled) {
            return res.status(400).json({ message: 'Cannot cancel completed or already cancelled ticket' });
        }

        ticket.status = TicketStatus.Cancelled;
        ticket.cancellationReason = cancellationReason;
        ticket.updatedAt = new Date();
        await ticket.save();

        return res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Request error' });
    }
};

export const getAllTickets = async (
    req: Request<{}, {}, {}, GetAllTicketsQuery>,
    res: Response<TicketType[] | { message: string }>
) => {
    try {
        const { startDate, endDate } = req.query;

        const allowedParams = ['startDate', 'endDate'];
        const queryParams = Object.keys(req.query);

        const invalidParams = queryParams.filter(param => !allowedParams.includes(param));
        if (invalidParams.length > 0) {
            return res.status(400).json({ message: `incorrect param: ${invalidParams.join(', ')}` });
        }

        const query: { createdAt?: { $gte?: Date; $lte?: Date } } = {};

        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ message: 'Incorrect startDate' });
            }
            query.createdAt = { $gte: start };
        }

        if (endDate) {
            const end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: 'Incorrect endDate' });
            }
            query.createdAt = query.createdAt
                ? { ...query.createdAt, $lte: end }
                : { $lte: end };
        }

        const tickets = await TicketService.getFilteredTickets(query);
        return res.status(200).json(tickets);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Request Error' });
    }
};

export const cancelAllInProgress = async (
    req: Request,
    res: Response<{ message: string }>
) => {
    try {
        await TicketService.updateTickets();
        return res.json({ message: `All tickets ${TicketStatus.InProgress} was cancelled` });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Request Error' });
    }
};

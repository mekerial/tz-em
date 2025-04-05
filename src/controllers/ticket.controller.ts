import express from 'express';
import {TicketService} from "../services/ticket.service";
import {TicketStatus} from '../types/ticketStatus';

export const createTicket = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const {subject, description}: {
            subject: string;
            description: string;
        } = req.body;

        if (!subject || !description) {
            return res.status(400).json({message: 'No data'});
        }

        const ticket = await TicketService.createTicket({subject, description});

        return res.status(201).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Request error'});
    }
};

export const takeInProgress = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const {id} = req.params;

        const ticket = await TicketService.findTicketById(id);

        if (!ticket) {
            return res.status(400).json({message: 'Not found'});
        }

        if (ticket.status === TicketStatus.InProgress) {
            return res.status(400).json({message: 'Status In working'});
        }

        if (ticket.status === TicketStatus.Completed) {
            return res.status(400).json({message: 'Status already completed'});
        }

        ticket.status = TicketStatus.InProgress;
        ticket.updatedAt = new Date();
        await ticket.save();

        res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Request error'});
    }
};

export const completeTicket = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const {resolution}: { resolution: string } = req.body;
        const id: string = req.params.id;

        const ticket = await TicketService.findTicketById(id);

        if (!ticket || ticket.status !== TicketStatus.InProgress) {
            return res.status(400).json({message: 'the request cannot be completed'});
        }

        ticket.status = TicketStatus.Completed;
        ticket.resolution = resolution;
        ticket.updatedAt = new Date();
        await ticket.save();

        res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Error'});
    }
};

export const cancelTicket = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const {cancellationReason}: { cancellationReason: string; } = req.body;
        const {id} = req.params;

        const ticket = await TicketService.findTicketById(id);

        if (!ticket) {
            return res.status(400).json({message: 'Not found'});
        }

        if (ticket.status === TicketStatus.Completed || ticket.status === TicketStatus.Cancelled) {
            return res.status(400).json({message: 'Cant completed'});
        }

        ticket.status = TicketStatus.Cancelled;
        ticket.cancellationReason = cancellationReason;
        ticket.updatedAt = new Date();
        await ticket.save();

        return res.status(200).json(ticket);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Request error'});
    }
};

export const getAllTickets = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        const {startDate, endDate}: { startDate?: string; endDate?: string } = req.query;

        const allowedParams = ['startDate', 'endDate'];
        const queryParams = Object.keys(req.query);

        const invalidParams = queryParams.filter(param => !allowedParams.includes(param));
        if (invalidParams.length > 0) {
            return res.status(400).json({message: `incorrect param: ${invalidParams.join(', ')}`});
        }

        const query: { createdAt?: { $gte?: Date; $lte?: Date; } } = {};

        if (startDate) {
            const start = new Date(startDate);

            if (isNaN(start.getTime())) {
                return res.status(400).json({message: 'Incorrect startDate'});
            }

            query.createdAt = {$gte: start};
        }

        if (endDate) {
            const end = new Date(endDate);

            if (isNaN(end.getTime())) {
                return res.status(400).json({message: 'Incorrect endDate'});
            }

            query.createdAt = query.createdAt
                ? {...query.createdAt, $lte: end}
                : {$lte: end};
        }

        const tickets = await TicketService.getFilteredTickets(query);

        return res.status(200).json(tickets);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Request Error'});
    }
};

export const cancelAllInProgress = async (req: express.Request, res: express.Response): Promise<any> => {
    try {
        await TicketService.updateTickets();

        return res.json({message: `All tickets ${TicketStatus.InProgress} was cancelled`});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: 'Request Error'});
    }
};
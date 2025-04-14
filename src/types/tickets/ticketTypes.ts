export type TicketType = {
    id: string;
    subject: string;
    description: string;
    status: string;
    resolution?: string;
    cancellationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateTicketBody = {
    subject: string;
    description: string;
};

export type CompleteTicketBody = {
    resolution: string;
};

export type CancelTicketBody = {
    cancellationReason: string;
};

export type TicketParams = {
    id: string;
};

export type GetAllTicketsQuery = {
    startDate?: string;
    endDate?: string;
};
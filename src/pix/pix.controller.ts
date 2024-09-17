import {
    Controller,
    Post,
    Body,
    Req,
    Res,
    Param,
    Get,
    Next,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './pix.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post('create-pix')
    async createPix(
        @Body() createPaymentDto: any,
        @Res() res: Response,
        @Next() next: NextFunction,
    ) {
        try {
            const payment =
                await this.paymentsService.createPix(createPaymentDto);
            res.json({ status: 'ok', payment });
        } catch (error) {
            next(error);
        }
    }

    @Post('webhook')
    async createWebHook(@Req() req: Request, @Res() res: Response) {
        const { action, data } = req.body;

        if (!action || !data?.id) {
            return res.status(400).send('Invalid webhook event format');
        }

        if (action === 'payment.created' || action === 'payment.updated') {
            try {
                const updatedPayment =
                    await this.paymentsService.handleWebhook(data);
                res.status(200).send('Webhook processed successfully');
            } catch (error) {
                res.status(500).json({
                    statusCode: 500,
                    data: 'Error processing the webhook',
                });
            }
        } else {
            res.status(400).send('Unsupported event');
        }
    }

    @Get('status/:id')
    async getPaymentStatus(
        @Param('id') paymentId: string,
        @Res() res: Response,
    ) {
        try {
            const status =
                await this.paymentsService.getPaymentStatus(paymentId);
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: 'Error fetching payment status' });
        }
    }
}

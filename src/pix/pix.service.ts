import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MercadoPagoConfig, Payment as MercadoPagoPayment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentDocument } from './schemas/pix-transaction.schema';

@Injectable()
export class PaymentsService {
    private readonly payment: MercadoPagoPayment;

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    ) {
        const client = new MercadoPagoConfig({
            accessToken:
                process.env.MERCADO_PAGO_ACCESS_TOKEN,
            options: {
                timeout: 5000,
                idempotencyKey: 'abc',
            },
        });

        this.payment = new MercadoPagoPayment(client);
    }

    async createPix(createPaymentDto: any) {
        const notificationUrl = 'https://loca.lt/mytunnelpassword';


        const body = {
            transaction_amount: createPaymentDto.transaction_amount,
            description: createPaymentDto.description,
            payment_method_id: 'pix',
            payer: {
                email: createPaymentDto.email,
                identification: {
                    type: 'cpf',
                    number: createPaymentDto.number_cpf,
                },
            },
            notification_url: notificationUrl,
        };

        const requestOptions = { idempotencyKey: uuidv4() };

        try {
            const result = await this.payment.create({ body, requestOptions });
       

            const createdPayment = new this.paymentModel({
                transaction_amount: createPaymentDto.transaction_amount,
                description: createPaymentDto.description,
                payment_method_id: 'pix',
                email: createPaymentDto.email,
                identificationType: 'cpf',
                number: createPaymentDto.number_cpf,
                status: 'pending',
                payment_id: result.id,
            });
            await createdPayment.save();

            return createdPayment;
        } catch (error) {
            console.error(error);
            throw new HttpException(
                'Error creating payment',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async handleWebhook(data: any) {
        const { id: paymentId } = data;

        try {
            const paymentResponse = await this.payment.get({ id: paymentId });
            const paymentStatus = paymentResponse.status;

            const updatedPayment = await this.paymentModel.findOneAndUpdate(
                { payment_id: paymentId },
                { status: paymentStatus },
                { new: true },
            );

            return updatedPayment;
        } catch (error) {
            console.error(error);
            throw new HttpException(
                'Error processing webhook',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getPaymentStatus(paymentId: string) {
        try {
            const payment = await this.paymentModel.findOne({
                payment_id: paymentId,
            });

            if (!payment) {
                throw new HttpException(
                    'Payment not found',
                    HttpStatus.NOT_FOUND,
                );
            }

            return { status: payment.status };
        } catch (error) {
            console.error('Error fetching payment status:', error);
            throw new HttpException(
                'Error fetching payment status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}

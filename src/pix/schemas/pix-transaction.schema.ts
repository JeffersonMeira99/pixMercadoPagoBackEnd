import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
    @Prop({ required: true })
    transaction_amount: number;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    payment_method_id: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    identificationType: string;

    @Prop({ required: true })
    number: string;

    @Prop({ required: true })
    status: string;

    @Prop({ required: true, type: String })
    payment_id: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

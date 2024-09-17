import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { LoggerModule } from './logger/logger.module';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from './jwt/jwt.module';
import { CryptoModule } from './crypto/crypto.module';
import { UserModule } from './user/user.module';
import { PaymentsModule } from './pix/pix.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        MongooseModule.forRoot('mongodb://mongoadmin:secret@localhost:27017', {
            dbName: 'mydatabase',
        }),
        LoggerModule,
        CryptoModule,
        JwtModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
            }),
            inject: [ConfigService],
        }),
        UserModule,
        PaymentsModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

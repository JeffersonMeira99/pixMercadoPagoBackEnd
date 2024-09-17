import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    private bcrypt: typeof bcrypt;
    private crypto: typeof crypto;

    constructor() {
        this.bcrypt = bcrypt;
        this.crypto = crypto;
    }

    hash(input: string, algorithm = 'sha256'): string {

        const hash = this.crypto
            .createHash(algorithm)
            .update(input)
            .digest('hex');

        return hash;
    }

    hashPassword(password: string, saltRounds = 10): Promise<string> {


        return new Promise((resolve, reject) => {
            this.bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return reject(err);
                }
                return resolve(hash);
            });
        });
    }

    comparePasswords(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.bcrypt.compare(
                plainPassword,
                hashedPassword,
                (err, result) => {
                    if (err) {
                        console.error('Error comparing passwords:', err);
                        return reject(false);
                    }
                    return resolve(result);
                },
            );
        });
    }

    randomString(length = 40): string {
        return this.crypto.randomBytes(length).toString('hex');
    }
}

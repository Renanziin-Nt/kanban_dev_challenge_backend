import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkService {
  private clerk;

  constructor(private configService: ConfigService) {
    this.clerk = createClerkClient({
      secretKey: this.configService.get('CLERK_SECRET_KEY'),
    });
  }

  async verifyToken(token: string) {
    try {
      const  payload  =  await verifyToken(token, {
        secretKey: this.configService.get('CLERK_SECRET_KEY'),
      });
      
      return payload;
    } catch (error) {
   
      throw new Error('Invalid token');
    }
  }

  async getUser(userId: string) {
    try {
      return await this.clerk.users.getUser(userId);
    } catch (error) {
      throw new Error('User not found');
    }
  }
}
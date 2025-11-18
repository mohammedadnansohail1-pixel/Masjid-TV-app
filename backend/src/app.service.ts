import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      message: 'Masjid Management Platform API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

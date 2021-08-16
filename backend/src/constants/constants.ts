import { SetMetadata } from '@nestjs/common';
import { GatewayMetadataExtended } from 'src/interfaces/gateway-metadata.interface';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const jwtSecretKey = 'secretKey';
export const wsOptions = {
  handlePreflightRequest: (req, res) => {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, authorization, x-token',
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': '1728000',
      'Content-Length': '0'
    };
    res.writeHead(200, headers);
    res.end();
  }
} as GatewayMetadataExtended;

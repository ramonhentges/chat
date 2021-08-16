import { GatewayMetadata } from '@nestjs/websockets';

export interface GatewayMetadataExtended extends GatewayMetadata {
  handlePreflightRequest: (req, res) => void;
}

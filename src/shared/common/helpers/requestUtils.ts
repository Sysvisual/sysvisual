import { Request } from 'express';
import { Site } from '../../../persistence/database/interface/Site';
import { WithId } from '../../../persistence/objectMapper';
import { JwtPayload } from 'jsonwebtoken';

const getSite = (request: Request): WithId<Site> => {
	return request.headers['X-Site'] as unknown as WithId<Site>;
};

const getJWTPayload = (request: Request): JwtPayload => {
	return request.headers['X-JWT-Payload'] as unknown as JwtPayload;
};

export { getSite, getJWTPayload };

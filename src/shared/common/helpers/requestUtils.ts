import { Request } from 'express';
import { Site } from '../../persistent/database/interface/Site';
import { WithId } from '../../persistent/objectMapper';
import { JwtPayload } from 'jsonwebtoken';

const getSite = (request: Request): WithId<Site> => {
	return request.headers['X-Site'] as unknown as WithId<Site>;
};

const getJWTPayload = (request: Request): JwtPayload => {
	return request.headers['X-JWT-Payload'] as unknown as JwtPayload;
};

export { getSite, getJWTPayload };

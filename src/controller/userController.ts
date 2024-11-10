import { Router } from 'express';
import { getLogger } from '../shared/common/logger';
import { checkTokenMiddleware } from '../middleware/checkToken';
import { Address } from '../shared/persistent/database/interface/Address';
import { mapUserToDTO, WithId } from '../shared/persistent/objectMapper';
import { PopulatedUser } from '../shared/persistent/database/interface/User';
import {
	createUser,
	getUser,
	getUsers,
} from '../shared/persistent/database/repository/UserRepository';
import { createContactDetails } from '../shared/persistent/database/repository/ContactDetailsRepository';
import { createAddress } from '../shared/persistent/database/repository/AddressRepository';
import { getSite } from '../shared/common/requestUtils';

const router = Router();

const logger = getLogger();

router.get('/', checkTokenMiddleware, async (req, res) => {
	try {
		const site = getSite(req)._id.toString();
		const result = await getUsers(site);

		if (result.isError) {
			return res.sendStatus(500);
		}

		const mappedResult = result.value?.map((u) =>
			mapUserToDTO(u as unknown as WithId<PopulatedUser>)
		);
		return res.status(200).json(mappedResult ?? []);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error('Unexpected error during call to GET /users/', {
				error: { ...error },
			});
		} else {
			logger.error('Unexpected error during call to GET /users/', { error });
		}
		res.sendStatus(500);
	}
});

router.get('/:userId', checkTokenMiddleware, async (req, res) => {
	try {
		const site = getSite(req)._id.toString();
		const result = await getUser(site, req.params.userId);

		if (result.isError) {
			return res.sendStatus(500);
		}

		if (!result.value) {
			return res.sendStatus(404);
		}

		return res
			.status(200)
			.json(mapUserToDTO(result as unknown as WithId<PopulatedUser>));
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error('Unexpected error during call to GET /users/', {
				error: { ...error },
			});
		} else {
			logger.error('Unexpected error during call to GET /users/', { error });
		}
		res.sendStatus(500);
	}
});

router.post('/', checkTokenMiddleware, async (req, res) => {
	try {
		const username = req.body.username;
		const password = req.body.password;
		const contactDetails = req.body.contactDetails;

		if (!username || !password || !contactDetails) {
			return res.sendStatus(400);
		}

		const email = contactDetails.email;
		const firstname = contactDetails.firstname;
		const surname = contactDetails.surname;
		const addresses = contactDetails.addresses;

		if (!email || !firstname || !surname || !addresses) {
			return res.sendStatus(400);
		}

		const addressIds = new Array<string>();
		for (const address of addresses as Address[]) {
			const createdAddress = await createAddress(address);

			if (createdAddress.isError || !createdAddress.value) {
				return res.sendStatus(500);
			}

			addressIds.push(createdAddress.value);
		}

		const createdContactDetails = await createContactDetails({
			email,
			firstname,
			surname,
			addresses: addressIds,
		});

		if (createdContactDetails.isError || !createdContactDetails.value) {
			return res.sendStatus(500);
		}

		const user = await createUser({
			username,
			password,
			contactDetails: createdContactDetails.value,
		});

		res.status(201).json(user);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Unexpected error during call to POST /users/', {
				error: { ...error },
			});
		} else {
			logger.error('Unexpected error during call to POST /users/', { error });
		}
		res.sendStatus(500);
	}
});

export default router;

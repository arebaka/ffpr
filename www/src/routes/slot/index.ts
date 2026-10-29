import { boosterRoute } from './booster';
import { characterRoute } from './character';
import { itemsRoute } from './items';
import { overviewRoute } from './overview';
import { partyRoute } from './party';
import { slotRoute } from './slot';

export const slotTree = slotRoute.addChildren([
	overviewRoute,
	partyRoute,
	characterRoute,
	itemsRoute,
	boosterRoute,
]);

import { createRoute, Link } from '@tanstack/solid-router';
import type { master } from 'ffpr';
import { createMemo, For, Show } from 'solid-js';

import { formatNumber } from '../../format';
import { Panel } from '../../ui';
import { slotRoute, useSlot } from './slot';

type Character = master.User['ownedCharacterList']['target'][number];

export const partyRoute = createRoute({
	getParentRoute: () => slotRoute,
	path: 'party',
	component: Party,
});

function Party() {
	const data = useSlot();
	const members = createMemo(
		() =>
			new Set(
				data.userData.corpsList.target.map(item => item.characterId),
			),
	);
	return (
		<Panel title='Party'>
			<ul class='cards'>
				<For each={data.userData.ownedCharacterList.target}>
					{character => (
						<Card
							character={character}
							member={members().has(character.id)}
						/>
					)}
				</For>
			</ul>
		</Panel>
	);
}

function Card(props: { character: Character; member: boolean }) {
	const parameter = () => props.character.parameter;
	return (
		<li class='nes-container is-rounded is-dark card'>
			<h4>{props.character.name}</h4>
			<Show when={props.member}>
				<p class='nes-text is-primary'>In the party</p>
			</Show>
			<dl>
				<dt>HP</dt>
				<dd>{formatNumber(parameter().currentHP)}</dd>
				<dt>MP</dt>
				<dd>{formatNumber(parameter().currentMP)}</dd>
				<dt>Exp</dt>
				<dd>{formatNumber(props.character.currentExp)}</dd>
			</dl>
			<Link
				to='/slot/party/$id'
				params={{ id: props.character.id }}
				class='nes-btn'
				aria-label={`Edit ${props.character.name}`}
			>
				Edit
			</Link>
		</li>
	);
}

import {
	Active,
	Over,
	UniqueIdentifier,
	closestCenter,
	Collision,
	getFirstCollision,
	pointerWithin,
	rectIntersection,
} from "@dnd-kit/core";
import type {
	Bucket,
	Fact,
	FactUidMap,
	MultiDragArgs,
	ReorderResult,
	CollisionDetectionArgs,
	CollisionStrategyProps,
} from "./types";

export const getDndProps = (active: Active, over: Over) => {
	const activeContainer = active.data.current?.sortable.containerId;
	const overContainer = over.data.current?.sortable.containerId || over.id;
	const activeIndex = active.data.current?.sortable.index;
	return { activeContainer, overContainer, activeIndex };
};

export const moveBetweenColumns = ({
	buckets,
	activeContainer,
	activeIndex,
	overIndex,
	overContainerIndex,
}: any) => {
	const bucketsCopy = [...buckets];
	const activeContainerIndex = bucketsCopy.findIndex((bucket) => bucket.label === activeContainer);

	const activeContainerFacts = [...bucketsCopy[activeContainerIndex].facts];
	const overContainerFacts = [...bucketsCopy[overContainerIndex].facts];

	const fact = activeContainerFacts.splice(activeIndex, 1);
	overContainerFacts.splice(overIndex, 0, ...fact);
	bucketsCopy[overContainerIndex].facts = overContainerFacts;
	bucketsCopy[activeContainerIndex].facts = activeContainerFacts;

	return bucketsCopy;
};

export const moveWithinColumn = ({ buckets, activeContainer, activeIndex, overIndex }: any) => {
	const bucketsCopy = [...buckets];
	const activeContainerIndex = bucketsCopy.findIndex((bucket) => bucket.label === activeContainer);

	const activeContainerFacts = [...bucketsCopy[activeContainerIndex].facts];

	const draggedFact = activeContainerFacts.splice(activeIndex, 1);
	activeContainerFacts.splice(overIndex, 0, ...draggedFact);
	bucketsCopy[activeContainerIndex].facts = activeContainerFacts;

	return bucketsCopy;
};

export const getIdToFactMap = (buckets: Bucket[]) => {
	return buckets.reduce((acc, bucket) => {
		bucket.facts.forEach((fact) => {
			acc[fact.uid] = fact;
		});
		return acc;
	}, {} as any);
};

export const getCurrentColumn = (buckets: Bucket[], factId: string) => {
	for (let i = 0; i < buckets.length; i++) {
		const bucketFactIds = buckets[i].facts.map((fact) => fact.uid);
		if (bucketFactIds.includes(factId)) return buckets[i];
	}
};

export const multiSelectTo = (
	buckets: Bucket[],
	selectedFactIds: string[],
	newFactId: string,
): string[] | null => {
	// Nothing already selected
	if (!selectedFactIds.length) {
		return [newFactId];
	}

	const columnOfNew = getCurrentColumn(buckets, newFactId);
	if (!columnOfNew) return null;
	const indexOfNew: number = columnOfNew.facts.map((fact) => fact.uid).indexOf(newFactId);

	const lastSelected: string = selectedFactIds[selectedFactIds.length - 1];
	const columnOfLast = getCurrentColumn(buckets, lastSelected);
	if (!columnOfLast) return null;
	const indexOfLast: number = columnOfLast.facts.map((fact) => fact.uid).indexOf(lastSelected);

	// multi selecting to another column
	// select everything up to the index of the current item
	if (columnOfNew !== columnOfLast) {
		return columnOfNew.facts.map((fact) => fact.uid).slice(0, indexOfNew + 1);
	}

	// multi selecting in the same column
	// need to select everything between the last index and the current index inclusive

	// nothing to do here
	if (indexOfNew === indexOfLast) {
		return null;
	}

	const isSelectingForwards: boolean = indexOfNew > indexOfLast;
	const start: number = isSelectingForwards ? indexOfLast : indexOfNew;
	const end: number = isSelectingForwards ? indexOfNew : indexOfLast;

	const inBetween: string[] = columnOfNew.facts.map((fact) => fact.uid).slice(start, end + 1);

	// everything inbetween needs to have it's selection toggled.
	// with the exception of the start and end values which will always be selected

	const toAdd: string[] = inBetween.filter((factUid: string): boolean => {
		// if already selected: then no need to select it again
		if (selectedFactIds.includes(factUid)) {
			return false;
		}
		return true;
	});

	const sorted: string[] = isSelectingForwards ? toAdd : [...toAdd].reverse();
	const combined: string[] = [...selectedFactIds, ...sorted];

	return combined;
};

export const getBucketContainerIndex = ({
	overContainer,
	buckets,
	bucketLabels,
	over,
}: {
	overContainer: string;
	buckets: Bucket[];
	bucketLabels: {};
	over: Over;
}) => {
	let containerIndex = buckets.findIndex((bucket) => bucket.label === overContainer);
	if (containerIndex === -1 && over.id in bucketLabels) {
		containerIndex = buckets.findIndex((bucket) => bucket.label === over.id);
	}
	return containerIndex;
};

const reorderSingleDrag = ({
	buckets,
	bucketLabels,
	selectedFactIds,
	active,
	over,
}: MultiDragArgs): ReorderResult | null => {
	if (active.id !== over.id) {
		const { activeContainer, overContainer, activeIndex } = getDndProps(active, over);
		const overContainerIndex = getBucketContainerIndex({
			overContainer,
			buckets,
			bucketLabels,
			over,
		});
		if (overContainerIndex === -1) return null;

		const overIndex =
			over.id in bucketLabels && buckets[overContainerIndex]
				? buckets[overContainerIndex].facts.length
				: over.data.current?.sortable.index;

		if (activeContainer === overContainer) {
			return {
				selectedFactIds,
				buckets: moveWithinColumn({
					buckets,
					activeContainer,
					activeIndex,
					overIndex,
				}),
			};
		} else {
			return {
				selectedFactIds,
				buckets: moveBetweenColumns({
					buckets,
					activeContainer,
					activeIndex,
					overContainerIndex,
					overIndex,
				}),
			};
		}
	}

	return null;
};

const withNewFacts = (bucket: Bucket, facts: Fact[]): Bucket => ({
	id: bucket.id,
	label: bucket.label,
	facts,
});

const getBucket = (buckets: Bucket[], bucketLabel: string): Bucket => {
	const bucketIndex = buckets.findIndex((e) => e.label === bucketLabel);
	const bucket = buckets[bucketIndex];

	return bucket;
};

const reorderMultiDrag = ({
	buckets,
	bucketLabels,
	selectedFactIds,
	active,
	over,
	mapIdToFact,
}: MultiDragArgs): ReorderResult | null => {
	if (active.id !== over.id) {
		const { activeContainer, overContainer, activeIndex } = getDndProps(active, over);
		const overContainerIndex = getBucketContainerIndex({
			overContainer,
			buckets,
			bucketLabels,
			over,
		});
		if (overContainerIndex === -1) return null;
		const overIndex =
			over.id in bucketLabels && buckets[overContainerIndex]
				? buckets[overContainerIndex].facts.length
				: over.data.current?.sortable.index;

		const draggedId = active?.id;

		let newIndex: number;
		if (over.id in bucketLabels) {
			newIndex = buckets[overContainerIndex].facts.length + 1;
		} else {
			const isBelowOverItem =
				over &&
				active.rect.current.translated &&
				active.rect.current.translated.top > over.rect.top + over.rect.height;

			const modifier = isBelowOverItem ? 1 : 0;

			newIndex =
				overIndex >= 0 ? overIndex + modifier : buckets[overContainerIndex].facts.length + 1;
		}

		// doing the ordering now as we are required to look up columns
		// and know original ordering
		const orderedSelectedFactIds: string[] = [...selectedFactIds];
		orderedSelectedFactIds.sort((a: string, b: string): number => {
			// moving the dragged item to the top of the list
			if (a === draggedId) {
				return -1;
			}
			if (b === draggedId) {
				return 1;
			}

			// sorting by their natural indexes
			const columnForA = getCurrentColumn(buckets, a);
			if (!columnForA) return 0;
			const indexOfA: number = columnForA.facts.map((fact) => fact.uid).indexOf(a);
			const columnForB = getCurrentColumn(buckets, b);
			if (!columnForB) return 0;
			const indexOfB: number = columnForB.facts.map((fact) => fact.uid).indexOf(b);

			if (indexOfA !== indexOfB) {
				return indexOfA - indexOfB;
			}

			// sorting by their order in the selectedFactIds list
			return -1;
		});

		// we need to remove all of the selected facts from their columns
		const bucketsCopy = [...buckets];
		for (let i = 0; i < bucketsCopy.length; i++) {
			const bucket = bucketsCopy[i];

			// remove the id's of the items that are selected
			const remainingFacts = bucket.facts.filter(
				(fact: Fact): boolean => !selectedFactIds.includes(fact.uid),
			);
			bucketsCopy[i] = withNewFacts(bucket, remainingFacts);
		}

		const finalIndex = getBucketContainerIndex({
			overContainer,
			buckets: bucketsCopy,
			bucketLabels,
			over,
		});
		const final: Bucket = bucketsCopy[finalIndex];
		const withInserted: Fact[] = (() => {
			const base: Fact[] = [...final.facts];
			const orderedSelectedFacts = orderedSelectedFactIds.map((factId) => mapIdToFact[factId]);
			base.splice(newIndex, 0, ...orderedSelectedFacts);
			return base;
		})();

		// insert all selected facts into final column
		bucketsCopy[finalIndex] = withNewFacts(final, withInserted);

		return {
			buckets: bucketsCopy,
			selectedFactIds: orderedSelectedFactIds,
		};
	}
	return null;
};

export const multiDragAwareReorder = (args: MultiDragArgs): ReorderResult | null => {
	if (args.selectedFactIds.length > 1) {
		return reorderMultiDrag(args);
	}
	return reorderSingleDrag(args);
};

export const getSelectedMap = (selectedFactIds: string[]) =>
	selectedFactIds.reduce((previous: FactUidMap, current: string): FactUidMap => {
		previous[current] = true;
		return previous;
	}, {});

// Determines if the platform specific toggle selection in group key was used
export const wasToggleInSelectionGroupKeyUsed = (event: MouseEvent | KeyboardEvent) => {
	const isUsingWindows = navigator.platform.indexOf("Win") >= 0;
	return isUsingWindows ? event.ctrlKey : event.metaKey;
};

// Determines if the multiSelect key was used
export const wasMultiSelectKeyUsed = (event: MouseEvent | KeyboardEvent) => event.shiftKey;

export const getBucketIdx = (buckets: Bucket[]) => (overId: UniqueIdentifier) => {
	return buckets.findIndex((bucket) => bucket.label === overId);
};

export const getBucketFacts = (buckets: Bucket[]) => (index: number) => {
	return buckets[index].facts.map((fact) => fact.uid);
};

export const customCollisionDetectionStrategy =
	(props: CollisionStrategyProps) =>
	(args: CollisionDetectionArgs): Collision[] => {
		const {
			containerIds,
			activeId,
			lastOverId,
			recentlyMovedToNewContainer,
			getContainerIdx,
			getContainerItems,
		} = props;
		if (activeId && activeId in containerIds) {
			return closestCenter({
				...args,
				droppableContainers: args.droppableContainers.filter(
					(container) => container.id in containerIds,
				),
			});
		}

		// Start by finding any intersecting droppable
		const pointerIntersections = pointerWithin(args);
		const intersections =
			pointerIntersections.length > 0
				? // If there are droppables intersecting with the pointer, return those
					pointerIntersections
				: rectIntersection(args);
		let overId = getFirstCollision(intersections, "id");

		if (overId !== null) {
			if (overId in containerIds) {
				const containerIdx = getContainerIdx(overId);
				const containerFacts = getContainerItems(containerIdx);

				// If a container is matched and it contains items (columns 'A', 'B', 'C')
				if (containerFacts.length > 0) {
					// Return the closest droppable within that container
					overId = closestCenter({
						...args,
						droppableContainers: args.droppableContainers.filter(
							(container) => container.id !== overId && containerFacts.includes(container.id),
						),
					})[0]?.id;
				}
			}

			lastOverId.current = overId;

			return [{ id: overId }];
		}

		// When a draggable item moves to a new container, the layout may shift
		// and the `overId` may become `null`. We manually set the cached `lastOverId`
		// to the id of the draggable item that was moved to the new container, otherwise
		// the previous `overId` will be returned which can cause items to incorrectly shift positions
		if (recentlyMovedToNewContainer.current) {
			lastOverId.current = activeId;
		}

		// If no droppable is matched, return the last match
		return lastOverId.current ? [{ id: lastOverId.current }] : [];
	};

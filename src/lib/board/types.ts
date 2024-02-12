import type { Active, DroppableContainer, Over, UniqueIdentifier } from "@dnd-kit/core";
import type { RectMap } from "@dnd-kit/core/dist/store";
import type { Coordinates } from "@dnd-kit/core/dist/types";
import type { MutableRefObject } from "react";

export type Bucket = {
	id: string;
	label: string;
	facts: Fact[];
};

export type Fact = {
	uid: string;
	content: string;
};

export type MultiDragArgs = {
	buckets: Bucket[];
	bucketLabels: any;
	selectedFactIds: string[];
	active: Active;
	over: Over;
	mapIdToFact?: any;
};

export type ReorderResult = {
	buckets: Bucket[];
	// a drop operations can change the order of the selected task array
	selectedFactIds: string[];
};

export type FactUidMap = {
	[factUid: string]: true;
};

export type CollisionDetectionArgs = {
	active: Active;
	collisionRect: any;
	droppableRects: RectMap;
	droppableContainers: DroppableContainer[];
	pointerCoordinates: Coordinates;
};

export type CollisionStrategyProps = {
	containerIds: {};
	activeId: UniqueIdentifier;
	lastOverId: MutableRefObject<UniqueIdentifier>;
	recentlyMovedToNewContainer: MutableRefObject<boolean>;
	getContainerIdx: (overId: UniqueIdentifier) => number;
	getContainerItems: (index: number) => any;
};

export type DndClassProps = {
	isDragging?: boolean;
	isSelected?: boolean;
	isGhosting?: boolean;
	isDragOverlay?: boolean;
};

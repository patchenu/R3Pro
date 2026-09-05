import type { Shift } from '../types/index.ts';

export interface ShiftCollisionResult {
  hasCollision: boolean;
  errorMessage: string | null;
  conflictingPair: {
    shift1: Shift;
    shift2: Shift;
    memberName: string;
    overlapMinutes: number;
  } | null;
}

export interface ShiftCapacityStats {
  capacity: number;
  claimedCount: number;
  remainingSpots: number;
  percentFilled: number;
  isFull: boolean;
  statusLabel: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'neutral';
}

/**
 * Validates whether two time intervals overlap in time
 * Formula: startA < endB && endA > startB
 */
export function validateShiftTimeOverlap(shiftA: Shift, shiftB: Shift): { hasOverlap: boolean; overlapMinutes: number } {
  if (!shiftA || !shiftB || shiftA.id === shiftB.id) {
    return { hasOverlap: false, overlapMinutes: 0 };
  }

  const startA = new Date(shiftA.startTime).getTime();
  const endA = new Date(shiftA.endTime).getTime();
  const startB = new Date(shiftB.startTime).getTime();
  const endB = new Date(shiftB.endTime).getTime();

  if (isNaN(startA) || isNaN(endA) || isNaN(startB) || isNaN(endB)) {
    return { hasOverlap: false, overlapMinutes: 0 };
  }

  const hasOverlap = startA < endB && endA > startB;
  if (!hasOverlap) {
    return { hasOverlap: false, overlapMinutes: 0 };
  }

  const overlapStart = Math.max(startA, startB);
  const overlapEnd = Math.min(endA, endB);
  const overlapMinutes = Math.max(1, Math.round((overlapEnd - overlapStart) / (1000 * 60)));

  return { hasOverlap: true, overlapMinutes };
}

/**
 * Strict Zero Double-Booking / Time Collision Validator
 * Guarantees that a volunteer (or specific household dependent) can only be in one place at a time.
 */
export function checkParticipantShiftCollisions(
  shiftAssignments: { shiftId: string; memberIndex: number }[],
  shifts: Shift[],
  memberNames: string[] = []
): ShiftCollisionResult {
  for (let i = 0; i < shiftAssignments.length; i++) {
    for (let j = i + 1; j < shiftAssignments.length; j++) {
      // Check if both assignments belong to the same person
      if (shiftAssignments[i].memberIndex === shiftAssignments[j].memberIndex) {
        const shift1 = shifts.find(s => s.id === shiftAssignments[i].shiftId);
        const shift2 = shifts.find(s => s.id === shiftAssignments[j].shiftId);

        if (shift1 && shift2) {
          const { hasOverlap, overlapMinutes } = validateShiftTimeOverlap(shift1, shift2);

          if (hasOverlap) {
            const memberName = memberNames[shiftAssignments[i].memberIndex] || `Participant ${shiftAssignments[i].memberIndex + 1}`;
            const time1 = `${new Date(shift1.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date(shift1.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            const time2 = `${new Date(shift2.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date(shift2.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

            return {
              hasCollision: true,
              errorMessage: `Schedule Conflict: ${memberName} cannot be assigned to both "${shift1.title}" (${time1}) and "${shift2.title}" (${time2}) because their hours overlap by ${overlapMinutes} minutes. A volunteer can only be in one place at a time.`,
              conflictingPair: {
                shift1,
                shift2,
                memberName,
                overlapMinutes
              }
            };
          }
        }
      }
    }
  }

  return {
    hasCollision: false,
    errorMessage: null,
    conflictingPair: null
  };
}

/**
 * Computes multi-volunteer capacity metrics for a shift slot
 */
export function getShiftCapacityStats(shift: Shift): ShiftCapacityStats {
  const capacity = Math.max(1, shift.capacity || 1);
  const claimedCount = Math.max(0, shift.claimedCount || 0);
  const remainingSpots = Math.max(0, capacity - claimedCount);
  const percentFilled = Math.min(100, Math.round((claimedCount / capacity) * 100));
  const isFull = claimedCount >= capacity;

  let statusLabel: string;
  let badgeVariant: 'success' | 'warning' | 'danger' | 'neutral';

  if (isFull) {
    statusLabel = 'Filled (Waitlist Open)';
    badgeVariant = 'danger';
  } else if (remainingSpots === 1) {
    statusLabel = '1 spot remaining';
    badgeVariant = 'warning';
  } else if (remainingSpots <= 3) {
    statusLabel = `${remainingSpots} spots remaining`;
    badgeVariant = 'warning';
  } else {
    statusLabel = `${remainingSpots} of ${capacity} spots open`;
    badgeVariant = 'success';
  }

  return {
    capacity,
    claimedCount,
    remainingSpots,
    percentFilled,
    isFull,
    statusLabel,
    badgeVariant
  };
}

/**
 * Suggests non-overlapping alternative shifts for a participant
 */
export function suggestAlternativeShifts(
  currentShift: Shift,
  allShifts: Shift[],
  participantAssignedShiftIds: string[]
): Shift[] {
  const assignedShifts = allShifts.filter(s => participantAssignedShiftIds.includes(s.id));

  return allShifts.filter(candidate => {
    // Exclude current shift and already assigned shifts
    if (candidate.id === currentShift.id || participantAssignedShiftIds.includes(candidate.id)) {
      return false;
    }

    // Must have open capacity
    if (candidate.claimedCount >= candidate.capacity) {
      return false;
    }

    // Must not overlap with any of participant's other assigned shifts
    for (const assigned of assignedShifts) {
      const { hasOverlap } = validateShiftTimeOverlap(candidate, assigned);
      if (hasOverlap) return false;
    }

    return true;
  });
}

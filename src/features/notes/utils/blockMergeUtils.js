/**
 * Block-Level Concurrent Conflict Resolution (Block-Level Merging)
 * Solves the Last-Write-Wins overwrite problem across iOS and Android devices.
 * Instead of overwriting an entire note, changes to distinct blocks are safely merged.
 */

/**
 * Ensures all blocks in an array have an id and updatedAt timestamp.
 */
export const tagBlockUpdate = (block) => {
  if (!block) return block;
  return {
    ...block,
    id: block.id || 'b-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    updatedAt: Date.now(),
  };
};

/**
 * Ensures every block in the note has a valid ID and timestamp.
 */
export const ensureBlockTimestamps = (blocks = []) => {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((b) => {
    if (!b) return b;
    return {
      ...b,
      id: b.id || 'b-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      updatedAt: b.updatedAt || Date.now(),
    };
  });
};

/**
 * Merges incoming remote blocks into local blocks using per-block timestamps.
 * 
 * @param {Array} localBlocks - Current blocks in user's local state.
 * @param {Array} incomingBlocks - Remote blocks arriving via Realtime or Delta sync.
 * @returns {Array} Cleanly merged blocks array preserving non-conflicting edits.
 */
export const mergeNoteBlocks = (localBlocks = [], incomingBlocks = []) => {
  if (!Array.isArray(incomingBlocks) || incomingBlocks.length === 0) {
    return Array.isArray(localBlocks) ? localBlocks : [];
  }
  if (!Array.isArray(localBlocks) || localBlocks.length === 0) {
    return incomingBlocks;
  }

  // Create a map of local blocks by ID
  const localMap = new Map();
  localBlocks.forEach((b) => {
    if (b && b.id) {
      localMap.set(b.id, b);
    }
  });

  // Create a map of incoming blocks by ID
  const incomingMap = new Map();
  incomingBlocks.forEach((b) => {
    if (b && b.id) {
      incomingMap.set(b.id, b);
    }
  });

  // Construct merged result based on the incoming structure
  const result = [];
  const processedIds = new Set();

  incomingBlocks.forEach((inBlock) => {
    if (!inBlock || !inBlock.id) return;
    processedIds.add(inBlock.id);

    const localBlock = localMap.get(inBlock.id);
    if (!localBlock) {
      // New block added remotely
      result.push(inBlock);
    } else {
      const localTime = Number(localBlock.updatedAt || 0);
      const inTime = Number(inBlock.updatedAt || 0);

      // If local block has a newer timestamp (user just edited it locally), keep local
      if (localTime > inTime) {
        result.push(localBlock);
      } else {
        result.push(inBlock);
      }
    }
  });

  // Check if there are local blocks that were recently created locally and not yet sent remotely
  localBlocks.forEach((locBlock) => {
    if (locBlock && locBlock.id && !processedIds.has(locBlock.id)) {
      const now = Date.now();
      const locTime = Number(locBlock.updatedAt || 0);
      // If locally created in the last 15 seconds, preserve it so local uncommitted additions aren't lost
      if (now - locTime < 15000) {
        result.push(locBlock);
      }
    }
  });

  return result.length > 0 ? result : incomingBlocks;
};

# Canvas import recovery

## Contract

Canvas import remains additive: it never replaces existing graph documents or quiz schedules. The optional `canvas-import-journal.json` sidecar records a versioned import intent before graph insertion. It contains complete intended documents and schedules; documents without NeDB `_id` receive one before intent is saved so retries preserve identity.

Recovery preflights the complete intent against the current database and schedules. Identical records count as already applied; absent records are inserted. Conflicting document IDs, internal IDs or schedules stop recovery without overwriting them. Duplicate identities within an intent are invalid. The sidecar is removed only after both document insertion and schedule persistence succeed.

Startup runs recovery before stale q1-cover repair and before graph requests. This ordering matters: changing an imported q1 cover before comparing it with the intent would create an artificial recovery conflict. If an import fails at runtime, subsequent graph requests and already-queued mutations are blocked until restart. The API reports `import_recovery_required` for that runtime blocked state. A startup recovery error is reported through the API and logged, with the journal retained for diagnosis.

## Failure boundaries

| Interruption | Restart behavior |
| --- | --- |
| Before intent rename | Native files have not been changed; an incomplete `.writing` file is not committed intent |
| After intent, before insertion | Insert the missing documents and schedules |
| During/after document insertion | Compare all intended identities; insert only missing records |
| Before schedule persistence | Preserve graph records and finish missing schedules |
| After schedule persistence, before journal removal | Recognize identical records and remove completed intent |
| Conflicting record or invalid journal | Refuse recovery; retain evidence and do not overwrite existing records |

This is process-restart roll-forward recovery, not an ACID transaction across NeDB and JSON files. There is no claim of power-loss durability without filesystem synchronization, or atomic snapshots for reads already in flight. As elsewhere in the application, only one server may own a data directory.

## Compatibility and operation

Native document and schedule formats are unchanged. Older application versions ignore the sidecar and cannot recover its pending operation. Finish recovery with the newer version before using an older version on that data directory. Do not simply delete a pending journal or restore whole files over newer edits to make startup succeed. For an actual conflict, preserve copies of all affected files and compare identities before choosing a manual repair.

The journal contains private knowledge just like the native database. Keep it with the data directory, out of source control. Large imports temporarily require additional disk space and JSON memory. The historical pre-journal import timings do not measure this implementation; benchmark again before making performance claims.

## Validation

The regression suite covers intent validation, preflight conflicts, partial persistence, repeated recovery and preservation of unrelated records on temporary NeDB databases. HTTP tests inject schedule persistence failure, assert graph access is blocked, restart and compare recovered native documents and schedules. Corrupt startup intent must remain intact and surface an error without an unhandled promise rejection.

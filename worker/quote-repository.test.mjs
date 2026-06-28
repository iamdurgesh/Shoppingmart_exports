import assert from "node:assert/strict";
import test from "node:test";

import { deleteExpiredQuoteRequests } from "./quote-repository.mjs";

test("deletes only queued quote requests older than the retention period", async () => {
  let preparedSql = "";
  let boundValue = "";
  const db = {
    prepare(sql) {
      preparedSql = sql;
      return {
        bind(value) {
          boundValue = value;
          return {
            run: async () => ({ meta: { changes: 3 } }),
          };
        },
      };
    },
  };

  const deletedCount = await deleteExpiredQuoteRequests(db, 365);

  assert.match(preparedSql, /status = 'queued'/);
  assert.match(preparedSql, /datetime\(created_at\)/);
  assert.equal(boundValue, "-365 days");
  assert.equal(deletedCount, 3);
});

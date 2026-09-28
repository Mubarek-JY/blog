#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/3e3532d3a7fc295b62715ff39a9068e41a95e453753cd8411cff28baa3d847ba/contract";
import endContractJson from "../../snapshots/3e3532d3a7fc295b62715ff39a9068e41a95e453753cd8411cff28baa3d847ba/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/b3909e3abc8efbda09c849b789a278ae82ac12677a78ebf5c290d9cb20129323/contract";
import startContractJson from "../../snapshots/b3909e3abc8efbda09c849b789a278ae82ac12677a78ebf5c290d9cb20129323/contract.json" with { type: "json" };
import { Migration, MigrationCLI, col } from "@prisma/orm-postgres/migration";
import postgresAdapter from "@prisma/orm-postgres/adapter/runtime";
import { sql } from "@prisma/orm-postgres/builder/runtime";
import {
  createExecutionContext,
  createSqlExecutionStack,
} from "@prisma/orm-postgres/family-runtime";
import postgresTarget, {
  PostgresContractSerializer,
} from "@prisma/orm-postgres/target/runtime";

const endContract = new PostgresContractSerializer().deserializeContract(
  endContractJson,
);
const stack = createSqlExecutionStack({
  target: postgresTarget,
  adapter: postgresAdapter,
});

const db = sql<End>({
  context: createExecutionContext({ contract: endContract, stack }),
  rawCodecInferer: stack.adapter.rawCodecInferer,
});

export default class M extends Migration<Start, End> {
  override readonly endContractJson = endContractJson;
  override readonly startContractJson = startContractJson;

  override get operations() {
    return [
      this.addColumn({
        schema: "public",
        table: "user",
        column: col("password", "text", { codecRef: { codecId: "pg/text@1" } }),
      }),
      this.dataTransform(endContract, "backfill-user-password", {
        check: () =>
          db.public.user
            .select("id")
            .where((f, fns) => fns.eq(f.password, null))
            .limit(1),
        run: () =>
          db.public.user
            .update({ password: "tempPassword" })
            .where((f, fns) => fns.eq(f.password, null)),
      }),
      this.setNotNull({ schema: "public", table: "user", column: "password" }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

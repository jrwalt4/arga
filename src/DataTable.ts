// DataTable.ts
namespace arga {
	
	let dt_counter: number = 0;

	export class DataTable implements IDataSchema {
		private _name: string;
		private _rows: DataRow[];
		private _columns: DataColumn[];
		private _keyPath: string;
		private _keyComparer: (keyA: string, keyB: string) => number;
		constructor(sName?: string, sKeyPath?: string) {
			this._name = sName || "Table" + dt_counter++;
			this._rows = [];
			this._columns = [];
			this._keyPath = sKeyPath;
			this._keyComparer = util.createKeyComparer(sKeyPath);
		}
		name(): string;
		name(sName: string): this;
		name(sName?: string): any {
			if (sName !== undefined) {
				this._name = sName;
				return this;
			}
			return this._name;
		}
		rows(): DataRow[] {
			return this._rows.slice();
		}

		addRow(oRow: DataRow): this {
			this._rows.push(oRow);
			oRow.table(this);
			return this;
		}

		schema(): IDataSchema {
			return this;
		}

		columns(): DataColumn[] {
			return this._columns;
		}

		keyPath(): string {
			return this._keyPath;
		}

		acceptChanges() {
			this._rows.forEach((dr: DataRow) => {
				dr.acceptChanges();
			})
		}
	}
}
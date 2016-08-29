// DataColumn.ts
namespace arga {
    export class DataColumn {
        private _name: string;
        private _constraints: DataColumnConstraint[];

        constructor() {

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
    }

}
import { DataTable } from '../core/DataTable';
export interface DataAdapterBase {
    updateAsync(dataTable: DataTable): PromiseLike<any>;
    fillAsync(dataTable: DataTable): PromiseLike<any>;
}

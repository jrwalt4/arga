// IDataAdapter.js

import DataTable = require('../core/DataTable')

interface DataAdapterBase {
        updateAsync(dataTable:DataTable):PromiseLike<any>
        fillAsync(dataTable:DataTable):PromiseLike<any>
    }

export = DataAdapterBase
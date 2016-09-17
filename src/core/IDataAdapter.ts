// IDataAdapter.js

import DataTable = require('./DataTable')

interface IDataAdapter {
        updateAsync(dataTable:DataTable):PromiseLike<any>
        fillAsync(dataTable:DataTable):PromiseLike<any>
    }

export = IDataAdapter
# Arga.js

## Description

A JavaScript implementation of the [ADO.NET DataSet](https://msdn.microsoft.com/en-us/library/ss7fbaez(v=vs.110).aspx) pattern, which is an in-memory data model that supports relational data and tracts changes. A DataSet is also a useful synchronous data source that can be linked with any persistant data source through the use of [DataAdapters](https://msdn.microsoft.com/en-us/library/system.data.common.dataadapter(v=vs.110).aspx), such as the indexedDB DataAdapter included with arga.js.

## Overview
- [Classes](#classes)
- [Usage](#usage)
- [Extending arga.js](#extending) 

## Classes

#### arga.DataSet
The main container for all related data stored in DataTables.

#### arga.DataTable
A table of rows with a common schema. schemas can be enforced through the use of DataColumn constraints, but otherwise any data can be added to any row.

#### arga.DataRow

#### arga.DataRelation

#### arga.IDataAdapter

## Usage

#### Initialize 
Data can be initialized manually
```JavaScript
var people = new arga.DataTable('people');

var reeseData = people.newRow();
reeseData.set({
    'name':'Reese',
    'age':27,
    'job':'Engineer'
});
people.addRow(reeseData);

var mattData = people.newRow();
mattData.set({
    'name': 'Matt',
    'age':29,
    'job','Student'
});
people.addRow(mattData);

dataSet.addTable(people);
```

... or via a DataAdapter such as the IdbDataAdapter...

```JavaScript
var dataSet = new arga.DataSet('people');

var db; 
indexedDB.open('data').onsuccess = function(ev){
    db = ev.target.result;
};
// assume indexedDB database has object store "people"

var dataAdapter = new IdbDataAdapter(db);
dataAdapter.selectCommand(new IdbCommand(function(db){
    return db.transaction('people')
                .objectStore('people');
}));

var people = new arga.DataTable("people");

dataAdapter.fillAsync(people).then(function(res) {
    console.log('success');
})
```

#### Update

```JavaScript
// change, add, or delete the data
var table = dataSet
            .tables().get("people")

var reeseData = table.rows().find({name:"Reese"});

// update the data
reeseData.set({age:28}); 
// reeseData.rowState() == DataRowState.MODIFIED

dataAdapter.updateCommand(new IdbCommand(function() {
    /* ... */
}))

dataAdapter.acceptChangesOnUpdate = true;

dataAdapter.updateAsync(table).then(function(){
    console.log('data updated successfully');
})

```

## Extending arga.js
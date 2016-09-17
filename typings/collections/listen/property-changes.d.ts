
interface PropertyChanges<T> {
    addOwnPropertyChangeListener(key:string, listener:PropertyChangeListener<T>, beforeChange?:boolean):void
    removeOwnPropertyChangeListener(key:string, listener:PropertyChangeListener<T>):void
    
    addBeforeOwnPropertyChangeListener(name:string, listener:PropertyChangeListener<T>):void
    removeBeforeOwnPropertyChangeListener(name:string, listener:PropertyChangeListener<T>):void

    dispatchOwnPropertyChange(key:string, value:any, beforeChange?:boolean):void
    dispatchBeforeOwnPropertyChange(key:string, value:any)

    makePropertyObservable(name:string):void
}

type PropertyChangeListener<T> = (value:any, key:string, collection:T)=>void | Object


declare module "collections/listen/property-changes" {

    import {PropertyChangeListener} from 'collections/types'
    
    export = PropertyChanges
    
    interface PropertyChanges<T> {
        addOwnPropertyChangeListener(key: string, listener: PropertyChangeListener<T>, beforeChange?: boolean): void
        removeOwnPropertyChangeListener(key: string, listener: PropertyChangeListener<T>): void

        addBeforeOwnPropertyChangeListener(name: string, listener: PropertyChangeListener<T>): void
        removeBeforeOwnPropertyChangeListener(name: string, listener: PropertyChangeListener<T>): void

        dispatchOwnPropertyChange(key: string, value: any, beforeChange?: boolean): void
        dispatchBeforeOwnPropertyChange(key: string, value: any)

        makePropertyObservable(name: string): void
    }

}
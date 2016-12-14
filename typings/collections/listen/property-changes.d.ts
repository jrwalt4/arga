declare module "collections/listen/property-changes" {
    
    export = PropertyChanges
    
    interface PropertyChanges<T> {
        addOwnPropertyChangeListener(key: string, listener: (value: any, key: string, collection: T) => void | Object, beforeChange?: boolean): void
        removeOwnPropertyChangeListener(key: string, listener: (value: any, key: string, collection: T) => void | Object): void

        addBeforeOwnPropertyChangeListener(name: string, listener: (value: any, key: string, collection: T) => void | Object): void
        removeBeforeOwnPropertyChangeListener(name: string, listener: (value: any, key: string, collection: T) => void | Object): void

        dispatchOwnPropertyChange(key: string, value: any, beforeChange?: boolean): void
        dispatchBeforeOwnPropertyChange(key: string, value: any)

        makePropertyObservable(name: string): void
    }

}
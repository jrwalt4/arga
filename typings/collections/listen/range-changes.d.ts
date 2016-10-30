declare module "collections/listen/range-changes" {

    import {RangeChangeListener} from 'collections/types'
    
    export = RangeChanges

    interface RangeChanges<T> {
        addRangeChangeListener(listener: RangeChangeListener<T>, token?: string, beforeChange?: boolean): void
        removeRangeChangeListener(listener: RangeChangeListener<T>, token?: string, beforeChange?: boolean): void
        addBeforeRangeChangeListener(listener: RangeChangeListener<T>, token?: string): void
        removeBeforeRangeChangeListener(listener: RangeChangeListener<T>, token?: string): void
        dispatchRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
        dispatchBeforeRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
    }
    
}
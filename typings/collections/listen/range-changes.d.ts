declare module "collections/listen/range-changes" {
    
    export = RangeChanges

    interface RangeChanges<T> {
        addRangeChangeListener(listener: (plus: T[], minus: T[], index: number) => void | Object, token?: string, beforeChange?: boolean): void
        removeRangeChangeListener(listener: (plus: T[], minus: T[], index: number) => void | Object, token?: string, beforeChange?: boolean): void
        addBeforeRangeChangeListener(listener: (plus: T[], minus: T[], index: number) => void | Object, token?: string): void
        removeBeforeRangeChangeListener(listener: (plus: T[], minus: T[], index: number) => void | Object, token?: string): void
        dispatchRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
        dispatchBeforeRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
    }
    
}
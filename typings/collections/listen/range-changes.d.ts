interface RangeChanges<T> {
    addRangeChangeListener(listener: RangeChangeListener<T>, token?: string, beforeChange?: boolean): void
    removeRangeChangeListener(listener: RangeChangeListener<T>, token?: string, beforeChange?: boolean): void
    addBeforeRangeChangeListener(listener: RangeChangeListener<T>, token?: string): void
    removeBeforeRangeChangeListener(listener: RangeChangeListener<T>, token?: string): void
    dispatchRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
    dispatchBeforeRangeChange(plus: T[], minus: T[], index, beforeChange: boolean): void
}

type RangeChangeListener<T> = (plus: T[], minus: T[], index: number) => void | Object
type EventEmitter = {
    _callbacks:Function[]
    emit(event:string):void
    on(event:string, action:(event:Event)=>void)
    on(event:string, action:(event:Event)=>void)
}
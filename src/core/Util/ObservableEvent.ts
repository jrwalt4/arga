export class ObservableEvent<TEventArgs> {
  private _listeners: Array<(eventArgs: TEventArgs) => void>
  subscribe(listener: (eventArgs: TEventArgs) => void): () => void {
    if (typeof listener === "function") {
      (this._listeners || (this._listeners = [])).push(listener);
      let listenersArray = this._listeners;
      return function unsubscribe() {
        unsubscribeListener(listener, listenersArray)
      }
    } else {
      throw new TypeError("listener must be of type: (EventArgs)=>void");
    }
  }
  unsubscribe(listener) {
    unsubscribeListener(listener, this._listeners);
  }
  publish(eventArgs: TEventArgs) {
    for (let callback of (this._listeners || (this._listeners = []))) {
      callback.call(void 0, eventArgs);
    }
  }
  get count(): number {
    return this._listeners.length;
  }
}

function unsubscribeListener(listener:Function, listenersArray:Function[]) {
  for (let index = 0; index < listenersArray.length; index++) {
    if (listenersArray[index] === listener) {
      listenersArray.splice(index, 1);
      // since a listener can subscribe multiple times,
      // keep iterating to remove all instances
      // (i.e. don't 'break')
    }
  }
}